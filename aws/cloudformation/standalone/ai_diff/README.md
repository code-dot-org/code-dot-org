# AI Diff Stack

This is the cloudformation stack defining _some_ of the resources for the AI Differentiation Bedrock Knowledge Base infrastructure. Elements of this must still be manually configured, and this is a work in progress.

## Deployment

The following process can only be carried out by a member of the Infra team using Admin permissions. Future upgrades could include rolling this into our `rake stack` commands that leverage other IAM roles, or implementing some kind of automatic CICD.

Generate a Change Set. This allows us to review the change before deploying.

```sh
aws cloudformation create-change-set \
    --stack-name ai-diff-production \
    --template-body file://ai_diff.yml \
    --change-set-name ai-diff-update \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters ParameterKey=Environment,ParameterValue=production ParameterKey=VectorIndexCreated,ParameterValue=true \
    --tags Key=Environment,Value=production
```

Now, lets review the Change Set. Log into the AWS Console and find the "ai-diff-production" stack. Find your Change Set in the "Change Sets" tab. Review any changes listed to ensure they match exactly the change you intend to make.

If you approve of the changes, execute the change set from the console.
