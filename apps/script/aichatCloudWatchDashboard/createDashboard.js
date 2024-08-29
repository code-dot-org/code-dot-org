const {
  CloudWatchClient,
  PutDashboardCommand,
} = require('@aws-sdk/client-cloudwatch');

const dashboardConfig = require('./config.js');

const putDashboard = async () => {
  const client = new CloudWatchClient({region: 'us-east-1'});
  const input = {
    DashboardName: 'GenAIBenTest',
    DashboardBody: JSON.stringify(dashboardConfig),
  };
  const command = new PutDashboardCommand(input);
  const response = await client.send(command);
  console.log(response);
};

putDashboard();
