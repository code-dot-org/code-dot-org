console.log('Loading function');

const AWS = require('aws-sdk');
const mysqlPromise = require('promise-mysql');
const Slack = require('slack-node');
const promisify = require('util-promisify');
const setTimeoutPromise = promisify(setTimeout);

const SLACK_WEBHOOK_URL = `https://hooks.slack.com/services/${process.env.SLACK_WEBHOOK_URL}`;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL;

const DB_INSTANCE_IDENTIFIER = process.env.DB_INSTANCE_IDENTIFIER;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const STATUS_SNS_TOPIC = process.env.STATUS_SNS_TOPIC;

var status_message = '';

var publishStatus = function publishStatus(message) {
  console.log('Posting status to Slack');
  var slack = new Slack();
  slack.setWebhook(SLACK_WEBHOOK_URL);
  var webhookPromise = promisify(slack.webhook);
  webhookPromise({
  channel: SLACK_CHANNEL,
    text: message
  })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });

  var sns = new AWS.SNS();
  sns.publish({
    Message: message,
    Subject: 'code.org verify offsite copy of database',
    TopicArn: STATUS_SNS_TOPIC
  }).promise()
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.log(error);
    });
};


exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));
  var eventMessage = JSON.parse(event.Records[0].Sns.Message);
  var eventID = eventMessage['Event ID'];
  if (eventID.endsWith('RDS-EVENT-0002')) {
    var rds = new AWS.RDS();
    var mysqlConnection;

    rds.modifyDBInstance({
      DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER,
      MasterUserPassword: DB_PASSWORD
    }).promise()
      .then(data => {
        console.log('Modify database password request has been submitted successfully.  Sleep for a few minutes until it completes.');
        // updating an RDS database master password typically takes 2-3 minutes, during which time the database transitions through several states:
        // 1) Available with old/unknown password.  Attempting to connect with new password will fail authentication
        // 2) Not Available (Status = resetting-master-credentials).  Attempt to connect as a mysql client or to invoke AWS describeDBInstances API fails
        // 3) Available with new password
        // Wait until about 2 minutes before this Lambda function reaches its 5 minute timeout before attempting to connect to the database
        return setTimeoutPromise(context.getRemainingTimeInMillis() - 120000, null);
      })
      .then(value => {
        // check if password update is pending
        return rds.describeDBInstances({
          DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER
        }).promise();
      })
      .then(data => {
        if (data.DBInstances[0].PendingModifiedValues.hasOwnProperty('MasterUserPassword')) {
          status_message = 'Terminating verification of database copy because database password change has not started yet.';
          return Promise.reject(new Error(status_message));
        } else {
          return mysqlPromise.createConnection({
            host: DB_HOST,
            database: DB_NAME,
            user: DB_USER,
            password: DB_PASSWORD
          });
        }
      })
      .then(conn => {
        mysqlConnection = conn;
        return mysqlConnection.query('SELECT count(*) AS number_of_users, max(updated_at) AS last_updated_at FROM users');
      })
      .then(rows => {
        status_message = 'Successfully queried offsite backup of database.  ' +
          'Number of Users = ' + rows[0].number_of_users +
          ', Last Updated = ' + rows[0].last_updated_at;
        console.log(status_message);
        publishStatus(status_message);
        mysqlConnection.end();

        return rds.deleteDBInstance({
          DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER,
          SkipFinalSnapshot: true
        }).promise();
      })
      .then(data => {
        callback(null, status_message);
      })
      .catch(error => {
        if (mysqlConnection && mysqlConnection.end) {
          mysqlConnection.end();
        }
        status_message = JSON.stringify(error);
        console.log(status_message);
        publishStatus(status_message);
        callback(error);
      });
  } else {
    status_message = 'Ignore trigger because it is not one that indicates RDS Snapshot restore is complete:  ' + eventID;
    console.log(status_message);
    callback(null, status_message);
  }
};
