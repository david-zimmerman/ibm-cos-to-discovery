
// Cloud Obect Storage authentication
const COS = require('ibm-cos-sdk-config');
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
const DiscoveryV1 = require('ibm-watson/discovery/v1');

const discovery = new DiscoveryV1({
  version: '2019-04-30',
  authenticator: new IamAuthenticator({
    apikey: 'twO_ZJ-vMgIjlEBpJ2FDZhBu3slARh51V78jBGEFzfua',
  }),
  serviceUrl: 'https://api.us-east.discovery.watson.cloud.ibm.com/instances/5f5192ff-6d72-4e06-a8d0-2ff969dbda05',
});

// Main function
async function main(args) {

  let processedRows = await readObject(args);
  for (let i = 1; i < processedRows.length; i++) {} // i=1 to ignore headers
    row = processedRows[i]
    let translatedText = await translateRow(row);
    title = row[3]; // Index for the "title" cell
    text = row[8]; // Index for the "text" cell
    let result = await discoveryAddDoc(translatedText, title, language, args);
    console.log("Result: " + result);
  
  return {message: result};
}

// readObject: read COS document and process rows
async function readObject(args) {

  const readObjectParams = {
    Bucket: args.bucket,
    Key: args.key
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

// translateRow: Identify text language and translate the text
async function translateRow(row) {

  // Identify language
  const translateParams = {
    text: row
  };

  languageTranslator.identify(translateParams)
  .then(identifiedLanguages => {
    console.log(JSON.stringify(identifiedLanguages, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });
  language = Object.values(identifiedLanguages)[0];

  translateParams.push({target: 'en'})

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
async function discoveryAddDoc(text, title, language) { // Include args if needing filename or fileContentType

  const addDocParams = {
    environmentId: 'ba9239ad-c0a3-4007-a2f5-e042acdf0a9c',
    collectionId: 'c09a011f-3abb-426a-9cba-d8ab755f86ea',
    file: text,
    // filename: args.key,
    // fileContentType: args.notification.content_type,
    metadata: {title: title, original_langauge: language}
  };

  discovery.addDocument(addDocParams)
  .then(documentAccepted => {
    console.log(JSON.stringify(documentAccepted, null, 2));
  })
  .catch(err => {
    console.log('error:', err);
  });

  return documentAccepted
}

exports.main = main;