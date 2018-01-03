console.log('Loading function');

const AWS = require('aws-sdk');
const mysqlPromise = require('promise-mysql');
const Slack = require('slack-node');

const SLACK_WEBHOOK_URL = `https://hooks.slack.com/services/${process.env.SLACK_WEBHOOK_URL}`;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL;

const DB_INSTANCE_IDENTIFIER = process.env.DB_INSTANCE_IDENTIFIER;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

var status_message = '';


var postStatusToSlack = function postStatusToSlack(message) {
    console.log('Posting status to Slack');
    var slack = new Slack();
    slack.setWebhook(SLACK_WEBHOOK_URL);
    slack.webhook({
            channel: SLACK_CHANNEL,
            text: message
        },
        function (error, response) {
            if (error) {
                console.log('Slack Post Error: ' + JSON.stringify(error));
            } else {
                console.log('Slack Post Response: ' + JSON.stringify(response));
            }
        }
    );
};


exports.handler = (event, context, callback) => {
    console.log(JSON.stringify(event));
    var eventMessage = JSON.parse(event.Records[0].Sns.Message);
    var eventID = eventMessage['Event ID'];
    if (eventID.endsWith('RDS-EVENT-0002')) {
        var rds = new AWS.RDS();

        var modifyDBPasswordParams = {
            DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER,
            MasterUserPassword: DB_PASSWORD
        };
        var modifyDBPasswordPromise = rds.modifyDBInstance(modifyDBPasswordParams).promise();
        modifyDBPasswordPromise.then(function (data) {
            console.log('Modify database password request has been submitted successfully.  Sleep for a few minutes until it completes.');
            // updating an RDS database master password typically takes 2-3 minutes, during which time the database transitions through several states:
            // 1) Available with old/unknown password.  Attempting to connect with new password will fail authentication
            // 2) Not Available (Status = resetting-master-credentials).  Attempt to connect as a mysql client or to invoke AWS describeDBInstances API fails
            // 3) Available with new password
            // Wait until about 2 minutes before this Lambda function reaches its 5 minute timeout before attempting to connect to the database
            setTimeout(function () {
                // check if password update is pending
                var describeDBInstancesPromise = rds.describeDBInstances({
                    DBInstanceIdentifier: 'verification-copy'
                }).promise();
                describeDBInstancesPromise.then(function (data) {
                    if (data.DBInstances[0].PendingModifiedValues.hasOwnProperty('MasterUserPassword')) {
                        status_message = 'Terminating verification of database copy because database password change has not started yet.';
                        console.error(status_message);
                        postStatusToSlack(status_message);
                        callback(new Error(status_message));
                    } else {
                        var connection;

                        mysqlPromise.createConnection({
                            host: DB_HOST,
                            database: DB_NAME,
                            user: DB_USER,
                            password: DB_PASSWORD
                        }).then(function (conn){
                            connection = conn;
                            return connection.query('SELECT count(*) AS number_of_users FROM users');
                        }).then(function (rows){
                            status_message = 'Successfully queried offsite backup of database.  Number of Users = ' + rows[0].number_of_users;
                            console.log(status_message);
                            postStatusToSlack(status_message);
                            connection.end();

                            var deleteDBInstanceParams = {
                                DBInstanceIdentifier: DB_INSTANCE_IDENTIFIER,
                                SkipFinalSnapshot: true
                            };
                            rds.deleteDBInstance(deleteDBInstanceParams, function (error, data) {
                                if (error) {
                                    console.log('Error deleting backup DB instance: ' + JSON.stringify(error), error.stack);
                                } else {
                                    console.log('Backup DB instance successfully deleted:  ' + JSON.stringify(data));
                                }
                            });
                            callback(null, status_message);
                        }).catch(function (error){
                            if (connection && connection.end) {
                                connection.end();
                            }
                            status_message = 'mysql error: ' + JSON.stringify(error);
                            console.log(status_message);
                            postStatusToSlack(status_message);
                            callback(error);
                        });
                    }
                }).catch(function (error){
                    status_message = 'Terminating verification of database copy because database is not available due to pending password change.  ' + error.stack;
                    console.error(status_message);
                    postStatusToSlack(status_message);
                    callback(error);
                });
            }, context.getRemainingTimeInMillis() - 60000);
        }).catch(function (error) {
            status_message = 'Terminating verification of database copy due to error modifying database master password.  ' + error.stack;
            console.error(status_message);
            postStatusToSlack(status_message);
            callback(error);
        });
    } else {
        status_message = 'Ignore trigger because it is not one that indicates RDS Snapshot restore is complete:  ' + eventID;
        console.log(status_message);
        callback(null, status_message);
    }
};
