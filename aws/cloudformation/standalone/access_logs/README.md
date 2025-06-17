# Access Logs Stack

CloudFront real-time log configuration storing all access logs to an S3 bucket.
Access logs are stored in compressed Parquet format, partitioned by date-hour (yyyy/MM/dd/HH),
and can be efficiently queried using Athena.

To store access logs, reference the exported config when defining a CloudFront distribution.

```yml
RealtimeLogConfigArn: !ImportValue AccessLogs-Config
```

## Deployment

The following process can only be carried out by a member of the Infra team using Admin permissions. Future upgrades could include rolling this into our `rake stack` commands that leverage other IAM roles, or implementing some kind of automatic CICD. It's also possible that this may all be replaced with a more unified logging system ([INF-1617](https://codedotorg.atlassian.net/browse/INF-1617)).

First, lets package up the Ruby lambdas.

```
aws cloudformation package \
  --template-file access_logs.yml \
  --s3-bucket cf-templates-p9nfb0gyyrpf-us-east-1 \
  --output-template-file packaged-template.yml
```

Next we will generate a Change Set. This allows us to review the change before deploying. This particular template requires careful attention to the `OldLogFields` parameter. Log into the AWS Console, find the "AccessLogs" Cloudformation Stack, and copy the previous "LogFields" parameter value. Use this for the `OldLogFields` value, which is pulled from [parameters.json]. Using a parameters file instead of inlining in the CLI avoids globbing and/or word splitting. Consider doing this before making any other changes to ensure you generate an empty change set.

```
aws cloudformation create-change-set \
  --stack-name AccessLogs \
  --template-body file://packaged-template.yml \
  --change-set-name access-logs-update \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters file://parameters.json
```

Now, lets review the Change Set. Log into the AWS Console and find the "AccessLogs" stack. Find your Change Set in the "Change Sets" tab. Review any changes listed to ensure they match exactly the change you intend to make. Any mistakes with `OldLogFields` will result in unexpected changes.

Finally, if you approve of the change set, you can execute it from the AWS Console or from the CLI.

```
aws cloudformation execute-change-set \
  --stack-name AccessLogs \
  --change-set-name access-logs-update
```

Don't forget to clean up!

```
rm packaged-template.yml
```
