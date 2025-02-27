
# **BOOMERAngel : Estensione per il Rilevamento di Siti di Phishing** 🛡️  

## 📌 **Descrizione**  
Questa estensione per Chrome consente agli utenti di inserire un URL e verificare se il sito corrispondente è legittimo o un sito di phishing. È facile da usare e offre un primo livello di protezione contro i tentativi di frode online.  

---

## 📂 **Risorse Utilizzate**  
📌 Il sistema utilizza i seguenti file salvati nella cartella `resources`:  
1. **Siti legittimi:** il file `legit_urls.csv`  
2. **Siti di phishing:** il file `phishing_urls.csv`  
3. **Feature estratte:** descritte nel documento `Phishing Websites Features.docx`  

---

## 🛠 **Estrazione delle Feature**  
🔍 Il processo di estrazione delle feature avviene come segue:  
1. Selezione casuale di **5000 URL legittimi** e **5000 URL di phishing**  
2. Estrazione delle feature basate **solo sulla barra degli indirizzi**  
3. Creazione di due **dataframe separati**, successivamente combinati e mescolati  
4. Tutte le operazioni di estrazione avvengono nel notebook **`Feature_Extraction.ipynb`**  

---

## 🎯 **Creazione e Salvataggio del Modello**  
🧠 Il modello di apprendimento automatico viene addestrato seguendo questi passaggi:  
1. **Suddivisione** del dataset in **training e testing**  
2. **Utilizzo di XGBoostClassifier** per addestrare i dati  
3. **Accuratezza finale:**  
   - **Training:** 81,9%  
   - **Testing:** 80,4%  
4. Il training avviene interamente nel notebook **`Feature_Extraction.ipynb`**  

---

## 🖥 **Utilizzo del Modello nell'Estensione**  
🔗 L'estensione interagisce con il modello seguendo questa struttura:  
1. Creazione dell'estensione con **manifest.json**, **popup.html** e **popup.js**  
2. L'estensione permette di inserire un URL personalizzato  
3. Il modello viene richiamato attraverso **Fetch API** da JavaScript al backend in **Flask** (`app.py`)  
4. Il risultato viene mostrato direttamente nell'estensione con un messaggio **"Legit"** o **"Phishing"**  

---

## 🚀 **Come Utilizzare l'Estensione**  
🔹 Segui questi semplici passi per installare e utilizzare l'estensione:  

1️⃣ **Scarica tutti i file** e inseriscili in una cartella unica  
2️⃣ **Aggiungi l'estensione a Chrome** tramite il pulsante **"Carica estensione non pacchettizzata"** nella finestra delle estensioni di Chrome  
3️⃣ **Avvia il backend** eseguendo `app.py` per avviare il server Flask  
4️⃣ **Utilizza l'estensione:**  
   - Clicca sull'icona dell'estensione  
   - Inserisci l'URL nello spazio dedicato  
   - Premi il pulsante **"Check"** per verificare il sito  

🔎 **Ora sei protetto dai siti di phishing!** 🛡️  

---

🎯 **Nota:** Questa estensione fornisce un primo livello di protezione, ma non sostituisce soluzioni avanzate di sicurezza. Usa sempre la massima cautela online!  
