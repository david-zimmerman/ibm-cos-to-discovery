
// Cloud Obect Storage authentication
const COS = require('ibm-cos-sdk');
const clientInfo = {
  iam_apikey: 'a_aIYyQRDrym0vjS0wbWC-mYOLHPQWv4SnZx3JEddAfT',
};
const client = new COS.ResourceConfigurationV1(clientInfo);
const csv=require('csvtojson');

// Translator authentication
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

const languageTranslator = new LanguageTranslatorV3({
  version: '2018-05-01',
  authenticator: new IamAuthenticator({
    apikey: 'iwtYcJp1lyY_ZCscoTEc5FkkfF2cHblTs22q-ZcnGwOg',
  }),
  serviceUrl: 'https://api.us-east.language-translator.watson.cloud.ibm.com/instances/27aa3a71-8664-4647-9e10-a25679b2bf87',
});

// Discovery authentication
const DiscoveryV2 = require('ibm-watson/discovery/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const discovery = new DiscoveryV2({
  version: '2019-11-22',
  authenticator: new IamAuthenticator({
    apikey: 'twO_ZJ-vMgIjlEBpJ2FDZhBu3slARh51V78jBGEFzfua',
  }),
  serviceUrl: 'https://api.us-east.discovery.watson.cloud.ibm.com/instances/5f5192ff-6d72-4e06-a8d0-2ff969dbda05',
});

// Main function
async function main(params) {

  let processedRows = await readObject(params);
  for (let i = 1; i < processedRows.length; i++) {} // i=1 to ignore headers
    text = processedRows[i][8]; // Index for the "text" cell
    let translatedText = await translateRow(text);
    let result = await discoveryAddDoc(translatedText, params);
    console.log("Result: " + result);
  
  return {message: result};
}

// readObject: read COS document and process rows
async function readObject(params) {

  const readObjectParams = {
    Bucket: params.bucket,
    Key: params.key
  }

  let COSObject = COS.getObject(readObjectParams)
  csvStr = COSObject.Body.toString();

  // Process from CSV String to CSV Row
  csvStr = result.body;

  csv({
    noheader:true,
    output: "csv"
  })
  .fromString(csvStr)
  .then((csvRow)=>{ 
    console.log(csvRow) // => [["1","2","3"], ["4","5","6"], ["7","8","9"]]
  })

  return csvRow
}

// translateRow: translate the text
async function translateRow(text) { // Does the language have to be identified?

  /*
  // Identify language
  const translateParams = {
    text: text
  };

  languageTranslator.identify(translateParams)
  .then(identifiedLanguages => {
    console.log(JSON.stringify(identifiedLanguages, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });
  */ 

  const translateParams = {
    text: text,
    target: 'en',
  };

  languageTranslator.translate(translateParams)
  .then(translationResult => {
    console.log(JSON.stringify(translationResult, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });

  return translationResult
}

// discoveryAddDoc: add Document to Discovery
async function discoveryAddDoc(text, params) {

  const addDocParams = {
    projectId: 'ba9239ad-c0a3-4007-a2f5-e042acdf0a9c', // Is project ID the same as Environment ID?
    collectionId: 'c09a011f-3abb-426a-9cba-d8ab755f86ea',
    file: text,
    filename: params.key,
    fileContentType: params.notification.content_type
    // Do you want any metadata?
  };

  discovery.addDocument(addDocParams)
    .then(response => {
      console.log(JSON.stringify(response.result, null, 2));
    })
    .catch(err => {
      console.log('error:', err);
    });

  return response
}

exports.main = main;