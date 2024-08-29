const {
  CloudWatchClient,
  GetDashboardCommand,
} = require('@aws-sdk/client-cloudwatch');
const fs = require('fs');

const getDashboardConfig = async () => {
  const client = new CloudWatchClient({region: 'us-east-1'});
  const input = {
    // GetDashboardInput
    DashboardName: 'GenAIPilot', // required
  };
  const command = new GetDashboardCommand(input);
  const response = await client.send(command);

  fs.writeFile(
    './existingConfig.json',
    JSON.stringify(JSON.parse(response.DashboardBody), null, 2),
    () => console.log('done')
  );
};

getDashboardConfig();
