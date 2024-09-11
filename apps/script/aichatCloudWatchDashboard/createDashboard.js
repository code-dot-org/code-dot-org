// See README.md in this directory for information on how to use this script.

const {
  CloudWatchClient,
  PutDashboardCommand,
} = require('@aws-sdk/client-cloudwatch');

const dashboardConfig = require('./config.js');
const {DASHBOARD_NAME} = require('./constants.js');

const putDashboard = async () => {
  const client = new CloudWatchClient({region: 'us-east-1'});
  const input = {
    DashboardName: DASHBOARD_NAME,
    DashboardBody: JSON.stringify(dashboardConfig),
  };
  const command = new PutDashboardCommand(input);
  const response = await client.send(command);
  console.log(response);
};

putDashboard();
