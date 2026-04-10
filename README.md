<div align="center">
  <img src="icon.png" alt="BOOMERAngel Logo" width="128"/>
  <h1>🛡️ BOOMERAngel</h1>
  <p><strong>Estensione Chrome per la Rilevazione Intelligente del Phishing</strong></p>
  <p>
    <a href="#-panoramica">Panoramica</a> •
    <a href="#-architettura-tecnica-e-lightgbm">LightGBM & Transpilazione</a> •
    <a href="#-come-usare-lestensione-locale">Locale</a> •
    <a href="#-il-sistema-di-fallback-con-api-python">API Fallback</a>
  </p>
</div>

---

## 🌟 Panoramica

**BOOMERAngel** è un'estensione browser sviluppata per analizzare in tempo reale gli URL allo scopo di rilevare e bloccare proattivamente tentativi di **Phishing**. 

Progettata con un'elegante interfaccia **Glassmorphism**, l'estensione estrae dal testo dell'URL ben 14 feature diverse (ad esempio l'entropia di Shannon, il conteggio dei punti o la ricerca di caratteri sospetti come `@`) pre-normalizzandole per valutarne all'istante l'affidabilità.

---

## 🧠 Architettura Tecnica e LightGBM

Il cuore decisionale del progetto è interamente affidato all'algoritmo di machine learning **LightGBM**. Dopo aver studiato e confrontato altri modelli, LightGBM è emerso come vincitore grazie alla sua impareggiabile velocità di inferenza e precisione.

Per poter far girare LightGBM all'interno dell'estensione Google Chrome è stato sviluppato un eccellente lavoro di ingegneria del software basato su due fronti:

### 1. La Transpilazione in JavaScript puro (Primo Binario)
Il modello matematico allenato in Python è stato **transpilato in codice JavaScript nativo** utilizzando l'incredibile libreria `m2cgen` (Model 2 Code Generator). Questo ci ha permesso di ottenere il file **`lgb_model.js`**. 
In questo modo, il "cervello" addestrato del modello risiede *fisicamente* nel set dell'estensione Chrome: le features non vengono quasi mai inviate a server remoti, vengono processate in locale e la valutazione "Safe/Phishing" è letteralmente istantanea (tempo di latenza nullo), tutelando la privacy dell'utente e il risparmio delle risorse.

### 2. Il Sistema di Fallback con API Python (Secondo Binario)
L'estensione garantisce un solido sistema di sicurezza. Qualora l'esecuzione nel browser dovesse riscontrare un problema (ad esempio, il file JavaScript *transpilato* non viene caricato in memoria dal browser), interviene automaticamente un **Modulo Fallback**. 
L'estensione re-instrada le richieste tramite rete all'API nativa Python servita dal framework **Flask** (`app.py`). Questo backend locale caricherà il modello canonico **`lightgbm.pkl`** per processare le richieste dall'endpoint `/predict`!

---

## 💻 Come Usare l'Estensione (Locale)

Per la modalità standard offline (identificabile nel risultato grazie al Badge Verde "💻 Locale"):

1. Vai in Google Chrome all'indirizzo `chrome://extensions/`.
2. Assicurati che in alto a destra la **Modalità Sviluppatore** sia attiva.
3. Clicca su **Carica estensione non pacchettizzata**.
4. Apri e seleziona la cartella principale del progetto contenente il `manifest.json`.
5. Ora, nel browser, puoi incollare il link da esaminare e ricevere istantaneamente le risposte generate da **LightGBM** (JavaScript puro)!

---

## ☁️ Il sistema di Fallback con API Python

Se vuoi simulare un crash dell'istanza client-side e vedere come agisce il sistema in Cloud/Remoto, puoi avviare l'API di fallback. Al variare della situazione l'interfaccia dell'estensione modificherà intelligentemente il proprio esito offrendo un Badge Azzurro "☁️ Cloud API".

**Per avviare il Server Backend:**
1. Assicurati di aver clonato ed attivato le dipendenze:
    ```bash
    pip install -r requirements.txt
    ```
2. Lancia l'endpoint Flask digitando:
    ```bash
    python app.py
    ```
3. Il server starà in ascolto sulla porta locale (`127.0.0.1:5000`). Qualora l'esecuzione dell'estensione Chrome dovesse fallire localmente (puoi forzarlo oscurando il richiamo allo script `lgb_model.js` nell'HTML), la richiesta arriverà in console permettendo sia al sistema che all'utente una totale continuità operativa.
