Code and configuration to create the AI Chat CloudWatch dashboard here:

https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/GenAICurriculum

In order to create or overwrite the existing dashboard:

- Run from this (`dashboard`) directory: `npx ts-node createDashboard.ts`

Modifications to the dashboard can be made by using the AWS web console to generate the graph ("widget") you'd like to use,
then either viewing the "Source" tab on the graph edit page, or running the script below to download the JSON config for the graph:

`node ./getExistingDashboardConfig.js`

Make any updates to `widgetCreators.ts` or `constants.ts` and run `createDashboard.ts` to align
the dashboard definition in code here with what's in CloudWatch.
