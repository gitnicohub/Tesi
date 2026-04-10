// popup.js

// Carica lgb_model.js se stiamo facendo previsioni offline
// La funzione "score_lgb(input)" è attesa a livello globale.

const checkButton = document.getElementById('checkButton');
const urlInput = document.getElementById('urlInput');
const resultDiv = document.getElementById('result');

// --- IMPLEMENTAZIONE FUNZIONI FEATURE EXTRACTION IN JAVASCRIPT ---

function getNetloc(url) {
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        return new URL(url).host;
    } catch(e) {
        return "";
    }
}

function getDomain(url) {
    let domain = getNetloc(url);
    if (domain.startsWith("www.")) {
        domain = domain.substring(4);
    }
    return domain;
}

function havingIP(url) {
    let domain = getDomain(url);
    // Regex semplice per matchare IP v4
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(domain)) {
        return 1;
    }
    return 0;
}

function haveAtSign(url) {
    return url.includes("@") ? 1 : 0;
}

function getLength(url) {
    return url.length < 54 ? 0 : 1;
}

function getDepth(url) {
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        let pathname = new URL(url).pathname;
        let s = pathname.split('/');
        let depth = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i].length !== 0) depth++;
        }
        return depth;
    } catch(e) {
        return 0;
    }
}

function redirection(url) {
    let pos = url.lastIndexOf("//");
    if (pos > 6) {
        if (pos > 7) return 1;
        return 0;
    }
    return 0;
}

function httpDomain(url) {
    let netloc = getNetloc(url);
    return netloc.includes("https") ? 1 : 0;
}

function tinyURL(url) {
    const shortening_services = /bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|tr\.im|link\.zip\.net/i;
    return shortening_services.test(url) ? 1 : 0;
}

function prefixSuffix(url) {
    let netloc = getNetloc(url);
    return netloc.includes('-') ? 1 : 0;
}

function domainAge(url) {
    return -1; // Bypass per evitare timeout come richiesto
}

function countDots(url) {
    let netloc = getNetloc(url);
    return (netloc.match(/\./g) || []).length;
}

function sensitiveWords(url) {
    const words = ['login', 'update', 'verify', 'secure', 'account', 'banking', 'confirm', 'password', 'paypal', 'apple', 'signin', 'admin'];
    let lower_url = url.toLowerCase();
    for (let word of words) {
        if (lower_url.includes(word)) return 1;
    }
    return 0;
}

function shannonEntropy(url) {
    let str = getNetloc(url);
    if (!str) str = url;
    let counts = {};
    for (let char of str) {
        counts[char] = (counts[char] || 0) + 1;
    }
    let entropy = 0;
    let len = str.length;
    for (let char in counts) {
        let p = counts[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

function countSpecialChars(url) {
    const specialChars = ['?', '=', '&', '%', '_'];
    let count = 0;
    for (let char of specialChars) {
        // Equivalente JS di url.count(char) in python
        count += url.split(char).length - 1;
    }
    return count;
}

function nonStandardPort(url) {
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        let port = new URL(url).port;
        if (port && port !== "80" && port !== "443" && port !== "") {
            return 1;
        }
        return 0;
    } catch(e) {
        return 0;
    }
}

// Estrazione totale
function extractFeatures(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url; // Basic normalization
    }
    
    // Rimuovi 'www.' per allineare alle feature del dataset ed eliminare palesi falsi positivi
    url = url.replace('http://www.', 'http://').replace('https://www.', 'https://');
    return [
        havingIP(url),
        haveAtSign(url),
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
    ];
}

// --- FUNZIONI DI UI ---

function setButtonLoading(isLoading) {
    if (isLoading) {
        checkButton.classList.add('checking');
        checkButton.disabled = true;
        checkButton.innerHTML = `
                    <div class="button-content">
                        <div class="spinner"></div>
                        <span>Analizzando...</span>
                    </div>
                `;
    } else {
        checkButton.classList.remove('checking');
        checkButton.disabled = false;
        checkButton.innerHTML = `
                    <div class="button-content">
                        <span>Verifica sicurezza</span>
                    </div>
                `;
    }
}

function updateResult(resultText, confidence = null, isError = false, source = 'local') {
    setButtonLoading(false);

    if (isError) {
        resultDiv.className = 'danger';
        resultDiv.innerHTML = `
                    <span class="result-icon">❌</span>
                    <div class="result-text">Errore:</div>
                    <div class="result-details">${resultText}</div>
                `;
        return;
    }

    const isSafe = resultText.toLowerCase().includes('legit');
    const confHtml = confidence !== null ? `<br>Sicurezza predittiva (Confidence): ${(Math.abs(confidence)).toFixed(3)}` : '';
    
    let sourceHtml = '';
    if (source === 'backend_lgb') {
        sourceHtml = `<div style="margin-top:10px;"><span style="display:inline-block; padding:3px 10px; background:rgba(0,122,255,0.1); border: 1px solid rgba(0,122,255,0.2); border-radius:12px; font-size:11px; color:#007aff; font-weight:600;">☁️ Cloud API</span></div>`;
    } else if (source === 'whitelist' || source === 'backend_whitelist') {
        sourceHtml = `<div style="margin-top:10px;"><span style="display:inline-block; padding:3px 10px; background:rgba(142,142,147,0.1); border: 1px solid rgba(142,142,147,0.2); border-radius:12px; font-size:11px; color:#8e8e93; font-weight:600;">🛡️ Whitelist Ufficiale</span></div>`;
    } else {
        sourceHtml = `<div style="margin-top:10px;"><span style="display:inline-block; padding:3px 10px; background:rgba(52,199,89,0.1); border: 1px solid rgba(52,199,89,0.2); border-radius:12px; font-size:11px; color:#248a3d; font-weight:600;">💻 Locale (Browser)</span></div>`;
    }

    if (isSafe) {
        resultDiv.className = 'safe';
        resultDiv.innerHTML = `
                    <span class="result-icon">✅</span>
                    <div class="result-text">Sito sicuro</div>
                    <div class="result-details">Il modello ha classificato l'URL come Legittimo.${confHtml}</div>
                    ${sourceHtml}
                `;
    } else {
        resultDiv.className = 'danger';
        resultDiv.innerHTML = `
                    <span class="result-icon">⚠️</span>
                    <div class="result-text">Pericolo rilevato!</div>
                    <div class="result-details">Rilevato schema di Phishing!${confHtml}</div>
                    ${sourceHtml}
                `;
    }
}

// ESECUZIONE OFFLINE
document.getElementById('checkButton').addEventListener('click', async function () {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        return updateResult('Inserisci un URL da verificare', null, true);
    }
    
    setButtonLoading(true);
    
    // Simula caricamento per percepire la UI
    await new Promise(r => setTimeout(r, 200));

    try {
        // --- CONTROLLO WHITELIST ---
        const whitelist = ['google.it', 'google.com', 'apple.com', 'yahoo.com', 'microsoft.com', 'amazon.com', 'amazon.it', 'youtube.com', 'youtube.it', 'instagram.com', 'facebook.com', 'facebook.it', 'twitter.com', 'x.com', 'linkedin.com', 'netflix.com', 'wikipedia.org'];
        let domainOnly = getDomain(url).toLowerCase();
        
        if (whitelist.includes(domainOnly)) {
            return updateResult("Legit", 1.0, false, 'whitelist');
        }

        // 1. Estrazione Funzioni in Locale se non presente in whitelist
        let features = extractFeatures(url);
        console.log("Feature estratte:", features);
        
        // 2. Inferenza offline tramite LightGBM JS generato, oppure fallback al Backend.
        if (typeof score_lgb === "function") {
            // Predizione in Chrome!
            let raw_output = score_lgb(features); 
            let confidence;
            let isPhishing;

            if (Array.isArray(raw_output)) {
                // m2cgen restituisce tipicamente [prob(0), prob(1)] per la classificazione
                confidence = raw_output[raw_output.length - 1]; // Afferriamo prob di Phishing (classe 1)
                isPhishing = confidence > 0.5;
            } else {
                // Se è uno score log-odds grezzo
                confidence = raw_output;
                isPhishing = confidence > 0.0; 
            }
            
            updateResult(isPhishing ? "Phishing" : "Legit", confidence);
        } else {
            console.error("Modello score_lgb non trovato, fallback all'API app.py backend...");
            // Fallback (utile se manca il file JS)
            fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            })
            .then(r => r.json())
            .then(data => updateResult(data.result, data.confidence, false, data.source))
            .catch(error => updateResult('Errore API: ' + error.message, null, true));
        }
    } catch(err) {
        updateResult(err.message, null, true);
    }
});

// Permetti invio con Enter
urlInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        checkButton.click();
    }
});