Code and configuration to create the AI Chat CloudWatch dashboard here:

https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/GenAIBenTest

In order to create or overwrite the existing dashboard, run the following from this directory:

```
yarn add @aws-sdk/client-cloudwatch
node ./createDashboard.js
```

Modifications to the dashboard can be made by using the AWS web console to generate the graph ("widget") you'd like to use,
then running the script below to download the JSON config for the graph:

`node ./getExistingDashboardConfig.js`

Move the new config into `config.js` and run `createDashboard.js` to align
the dashboard definition in code here with what's in CloudWatch.
