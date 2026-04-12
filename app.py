from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
from urllib.parse import urlparse
import ipaddress
import re
import math
from collections import Counter

app = Flask(__name__)
CORS(app)

model = None
MODEL_PATH = 'lightgbm.pkl'

def load_resources():
    global model
    try:
        print("Loading LightGBM model from pickle...")
        with open(MODEL_PATH, 'rb') as handle:
            model = pickle.load(handle)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

load_resources()

# ---- FEATURE EXTRACTION ----
def getDomain(url):  
    domain = urlparse(url).netloc
    if re.match(r"^www.", domain):
        domain = domain.replace("www.", "")
    return domain

def havingIP(url):
    try:
        ipaddress.ip_address(url)
        return 1
    except:
        return 0

def haveAtSign(url):
    return 1 if "@" in url else 0

def redirection(url):
    pos = url.rfind('//')
    if pos > 6:
        return 1 if pos > 7 else 0
    return 0

def httpDomain(url):
    domain = urlparse(url).netloc
    return 1 if 'https' in domain else 0

def tinyURL(url):
    shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|" \
                          r"yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|" \
                          r"short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|" \
                          r"doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|" \
                          r"qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|" \
                          r"po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|" \
                          r"prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|" \
                          r"tr\.im|link\.zip\.net"
    match = re.search(shortening_services, url)
    return 1 if match else 0

def prefixSuffix(url):
    return 1 if '-' in urlparse(url).netloc else 0

def domainAge(url):
    return -1

def countDots(url):
    domain = urlparse(url).netloc
    return domain.count('.')

def sensitiveWords(url):
    sensitive_words = ['login', 'update', 'verify', 'secure', 'account', 'banking', 'confirm', 'password', 'paypal', 'apple', 'signin', 'admin']
    url_lower = url.lower()
    for word in sensitive_words:
        if word in url_lower:
            return 1
    return 0

def shannonEntropy(url):
    string = urlparse(url).netloc
    if not string:
        string = url
    p, lns = Counter(string), float(len(string))
    return -sum( count/lns * math.log(count/lns, 2) for count in p.values())

def countSpecialChars(url):
    special_chars = ['?', '=', '&', '%', '_']
    count = 0
    for char in special_chars:
        count += url.count(char)
    return count

def nonStandardPort(url):
    try:
        port = urlparse(url).port
        if port is not None and port not in [80, 443]:
            return 1
        return 0
    except:
        return 0

def featureExtractionSafe(url):
    # Same normalizzazione of JS
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'http://' + url
    
    # Strip 'www.' to match dataset distribution and prevent false positives from extra dots/entropy
    url = url.replace('http://www.', 'http://').replace('https://www.', 'https://')
    
    features = [
        havingIP(url),
        haveAtSign(url),
        # getLength(url),
        # getDepth(url),
        redirection(url),
        httpDomain(url),
        tinyURL(url),
        prefixSuffix(url),
        domainAge(url),
        countDots(url),
        sensitiveWords(url),
        shannonEntropy(url),
        countSpecialChars(url),
        nonStandardPort(url)
    ]
    return [features] # returns array of samples

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "message": "Il server è attivo! Il backend LightGBM in Python è pronto all'uso come fallback dell'estensione offline."
    })

@app.route('/predict', methods=['POST'])
def predict():
    global model
    if model is None:
        load_resources()
        if model is None:
            return jsonify({'result': 'Error: LightGBM Model not found. Run the Python Notebook first.'}), 500

    try:
        data = request.get_json()
        if not data or 'url' not in data:
             return jsonify({'result': 'No URL provided'}), 400
             
        url = data['url']
        
        # --- CONTROLLO WHITELIST ---
        whitelist = ['google.it', 'google.com', 'apple.com', 'yahoo.com', 'microsoft.com', 'amazon.com', 'amazon.it', 'youtube.com', 'youtube.it', 'instagram.com', 'facebook.com', 'facebook.it', 'twitter.com', 'x.com', 'linkedin.com', 'netflix.com', 'wikipedia.org']
        domain_only = getDomain(url).lower()
        if domain_only in whitelist:
            return jsonify({
                'result': 'Legit',
                'confidence': 1.0,
                'source': 'backend_whitelist'
            })
        
        # Estrazione features (14 cols)
        X_predict = featureExtractionSafe(url)
        
        # Predict usando il pickle di LightGBM
        # lgb predict() di un classificatore binario restituisce classe o probabilità a seconda se usiamo predict_proba
        try:
            # Se è predict_proba, ci darà le prob per la classe 0 e 1.
            probs = model.predict_proba(X_predict)
            prediction_prob = probs[0][1] # Probability of Class 1 (Phishing)
        except:
            # Fallback se predict() resitutisce direttamente 0 o 1, o float crudo.
            raw_pred = model.predict(X_predict)[0]
            prediction_prob = float(raw_pred)

        is_phishing = prediction_prob > 0.5
        result = 'Phishing' if is_phishing else 'Legit'
        
        return jsonify({
            'result': result,
            'confidence': float(prediction_prob),
            'source': 'backend_lgb' # Indica che la predizione viene dal backend
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'result': f'Server Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
