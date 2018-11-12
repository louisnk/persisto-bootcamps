'use strict';
const aws = require('aws-sdk');
const postmark = require('postmark');
const qs = require('query-string');
const config = require('./config/index.js');
const extend = require('lodash.assignin');
const isPlainObject = require('lodash.isplainobject');

const templates = (originator) => {
  return !originator ? 8040543 : 8040542;
}


class Service {
  constructor() {

  }

  prepEmail(person={}, toAddress='', originator=false) {
    let replyDate = new Date();
    replyDate.setDate(replyDate.getDate() + 7);
    let replyString = `${replyDate.getDate()}/${replyDate.getMonth() + 1}/${replyDate.getFullYear()}`;

    return {
        "From": "louis@persistolabs.com",
        "To": toAddress,
        "TemplateId": templates(originator),
        "TemplateModel": {
          "name": person.name,
          "support_email": config.emails.support,
          "budget": person.budget,
          "email": person.email,
          "description": person.description,
          "reply_by": replyString
        }
    };
  }

  sendEmailBatch(messages) {
    console.log('trying to send emails')
    let client = new postmark.Client(config.postmark.key);
    return new Promise((resolve, reject) => {
      client.sendEmailBatch(messages, (err, done) => {
        if (!err) {
          console.log('Successfully sent to ourselves');
          return resolve(done);
        } else {
          return reject(err);
        }
      });
    })
  }

  uploadToS3(body={}, name) {
    console.log(body, name)
    if (!isPlainObject(body) || typeof name !== 'string') {
      return Promise.reject("Invalid params sent to upload to S3");
    }
    let s3 = new aws.S3()

    console.log('trying to upload to s3', body, name)
    return s3.putObject({
      Body: Buffer.from(JSON.stringify(body)),
      Bucket: config.aws.bucket,
      Key: `${name}.json`
    }).promise();
  }
}

module.exports.post = (event, context, callback) => {
  console.log(event)
  let body = event && event['body'];
  let params = isPlainObject(body) ? body : qs.parse(body);
  let service = new Service();

  let name = params.name && params.name.split(/ '-/).join('') + '-' + new Date().getTime();

  let toSend = [
    { email: params.email, originator: true },
    { email: config.emails.louis },
    { email: config.emails.misha }
  ].map((email, i) =>
    service.prepEmail(params, email.email, email.originator));

  console.log('Using params: ', params);

  return service.uploadToS3(params, name)
    .then(done => {
      console.log('Sending emails...');
      return service.sendEmailBatch(toSend);
    }).then(sent => {
      console.log('success!', sent);
      return callback(null, formatRedirectSuccess(sent))
    }).catch(err => {
      console.error('ERROR - ', err);
      return callback(formatErrorHelper(err.message));
    });
};

module.exports.test = (event, context, callback) => {
  let query = event['queryStringParameters'];
  console.log('query - ', query, event);

  let res = {
    statusCode: 200,
    body: JSON.stringify(query)
  }

  return callback(null, res);
};

const formatSuccessHelper = (response) => {
  return {
    "statusCode": 200,
    "body": response
  }
};

const formatRedirectSuccess = (sent) => {
  console.log('redirecting: ', sent)
  return {
    statusCode: 302,
    body: "",
    headers: {
      "Location": "https://persistolabs.com/"
    }
  }
};

const formatErrorHelper = (response) => {
  return {
    "statusCode": 500,
    "body": response
  }
};
