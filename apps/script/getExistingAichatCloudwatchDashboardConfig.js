const {
  CloudWatchClient,
  GetDashboardCommand,
} = require('@aws-sdk/client-cloudwatch');
const fs = require('fs');

const getDashboard = async () => {
  const client = new CloudWatchClient({region: 'us-east-1'});
  const input = {
    // GetDashboardInput
    DashboardName: 'GenAIPilot', // required
  };
  const command = new GetDashboardCommand(input);
  const response = await client.send(command);

  fs.writeFile(
    './dashboardConfig.json',
    JSON.stringify(JSON.parse(response.DashboardBody), null, 2),
    () => console.log('done')
  );
};

getDashboard();
