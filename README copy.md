# Phishing-Website-Detector-Extension 

## Description

This Phishing Website detector extension is an easy-to-use Chrome extension which allows the users to enter any URL and check if the corresponding website is a phishing website or a legit website

## Resources Used

1. For legit sites, the file legit_urls.csv is used (saved inside the resources folder)
2. For phishing sites, the file phishing_urls.csv is used (saved inside the resources folder)
3. The features extracted from the URLs are mentioned in Phishing Websites Features.docx (saved inside the resources folder)

## Feature Extraction

1. 5000 legit and phishing URLs each are chosen randomly
2. Their features are extracted: only address bar based features are used in this project
3. Their individual dataframes (obtained using feature extraction) are combined and shuffled
4. All the feature extraction occurs in the Feature_Extraction.ipynb

## Making and Saving the Model

1. Train Test split is employed on the combined dataframe
2. XGBoostClassifier is used to train the data
3. Final accuracy: Training: 81.9% , Testing: 80.4%
4. All the training occurs in the Feature_Extraction.ipynb
5. The model is saved: XGBoostClassifer.pickle.dat

## Using the model in the extension

1. A Chrome extension is built using manifest.json, popup.html and popup.js
2. The extension allows you to enter a custom URL
3. The model is employed using the Fetch API from JS to the backend Flask server running in app.py
4. The result is directly shown in the extension itself - Legit or Phishing

## How to Use

1. Download all files and folders and place into one folder
2. Add the extension to Chrome via the 'load unpacked' button on Chrome Extensions Window
3. Run the app.py to run the backend Flask server
4. Now, click on the extension, enter the URL into the space provided and click on 'Check' button
