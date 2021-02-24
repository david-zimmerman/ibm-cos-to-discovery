/**
 * This action will read from Cloud Object Storage.  If the Cloud Object Storage
 * service is not bound to this action or to the package containing this action,
 * then you must provide the service information as argument input to this function.
 * Cloud Functions actions accept a single parameter, which must be a JSON object.
 *
 * In this case, the args variable will look like:
 *   {
 *     "bucket": "your COS bucket name",
 *     "key": "Name of the object to read"
 *   }
 */

const CloudObjectStorage = require('ibm-cos-sdk');

async function main(args) {
  var cos = await new CloudObjectStorage.S3(cosConfig);
  let doc = await getCOS();
  let processedRows = await processRows(doc);
  let translatedRows = await translateLanguage(processedRows);
  let result = await pushToDiscovery(translatedRows);
  console.log("Result: " + result);
  return {
    message: result
  };
}

function main(){} // call translate, call discovery, move instances to the top

 async function main(args) {
  const { cos, params } = getParamsCOS(args, CloudObjectStorage);
  let response;
  const result = params;

  if (!params.bucket || !params.key || !cos) {
    result.message = "bucket name, key, and apikey are required for this operation.";
    throw result;
  }

  try {
    response = await cos.getObject({ Bucket: params.bucket, Key: params.key }).promise();
  } catch (err) {
    console.log(err);
    result.message = err.message;
    throw result;
  }
  result.body = response.Body.toString();
  return result;
}

function getParamsCOS(args, COS) {
  var bxCredsApiKey;
  var bxCredsResourceInstanceId;

  if (args.__bx_creds && args.__bx_creds['cloud-object-storage']) {
    if (args.__bx_creds['cloud-object-storage'].apikey) {
      bxCredsApiKey = args.__bx_creds['cloud-object-storage'].apikey;
    }
    if (args.__bx_creds['cloud-object-storage'].resource_instance_id) {
      bxCredsResourceInstanceId = args.__bx_creds['cloud-object-storage'].resource_instance_id;
    }
  }

  const { bucket, key } = args;
  const endpoint = args.endpoint || 's3.us.cloud-object-storage.appdomain.cloud';
  const ibmAuthEndpoint = args.ibmAuthEndpoint || 'https://iam.cloud.ibm.com/identity/token';
  const apiKeyId = args.apikey || args.apiKeyId || bxCredsApiKey || process.env.__OW_IAM_NAMESPACE_API_KEY;
  const serviceInstanceId = args.resource_instance_id || args.serviceInstanceId || bxCredsResourceInstanceId;

  const params = {};
  params.bucket = bucket;
  params.key = key;

  if (!apiKeyId) {
    const cos = null;
    return { cos, params};
  }

  const cos = new COS.S3({
    endpoint, ibmAuthEndpoint, apiKeyId, serviceInstanceId,
  });
  return { cos, params };
}

/**
csvStr:
1,2,3
4,5,6
7,8,9
*/
const csv=require('csvtojson')
csv({
	noheader:true,
	output: "csv"
})
csvStr = result.body;
.fromString(csvStr)
.then((csvRow)=>{ 
	console.log(csvRow) // => [["1","2","3"], ["4","5","6"], ["7","8","9"]]
})

const LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');
const extend = require('extend');
const vcap = require('vcap_services');

function main(){} // call translate, call discovery

for (let i = 1; i < csvRow.length; i++) { // i=1 to ignore headers

  //translate
  
  text = csvRow[i][8]; // 8 for text column

  function main(text, params) {
    return new Promise((resolve, reject) => {
      const _params = vcap.getCredentialsFromServiceBind(
        params,
        'language-translator',
        'language_translator'
      );
      _params.headers = extend(
        {},
        _params.headers,
        { 'User-Agent': 'openwhisk' }
      );
      let service;
      
      _params.push({text:text, target:"en"});
      
      try {
        service = new LanguageTranslatorV3(_params);
        service.translate(_params, (err, response) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err.message);
        return;
      }
    });
  }

  global.main = main;
  module.exports.test = main;

  const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
  const extend = require('extend');
  const vcap = require('vcap_services');

  //add-document
  function main(text, params) {
    return new Promise((resolve, reject) => {
      const _params = vcap.getCredentialsFromServiceBind(params, 'discovery');
      _params.headers = extend(
        {},
        _params.headers,
        { 'User-Agent': 'openwhisk' }
      );
      const fileParams = ['file'];
      fileParams.filter(fileParam => _params[fileParam]).forEach((fileParam) => {
        try {
          _params[fileParam] = Buffer.from(_params[fileParam], 'base64');
        } catch (err) {
          reject(err.message);
          return;
        }
      });
      let service;
      try {
        service = new DiscoveryV1(_params);
        service.addDocument(text, (err, response) => { // add Document if just text
          if (err) {
            reject(err.message);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err.message);
        return;
      }
    });
  }

  global.main = main;
  module.exports.test = main;
}