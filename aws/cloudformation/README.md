# /cloudformation

TODO: update this readme for new lambda locations

This directory contains CloudFormation stack templates, associated Custom Resource Lambda functions, and some other related scripts and configuration.

To run lambda tests:

```
npm install
npm run lint
npm test
```

## Directory Resources

* [`cloud_formation_stack.yml.erb`](cloud_formation_stack.yml.erb)  
  Stack template for the monolithic Code.org application.
- `*.yml`, `*.yml.erb`  
  Various other standalone or service-oriented stack templates. (e.g., [vpc.yml.erb](vpc.yml.erb), [iam.yml.erb](iam.yml.erb), [data.yml.erb](data.yml.erb), [lambda.yml.erb](lambda.yml.erb), [alerting.yml.erb](alerting.yml.erb), [`geocoder.yml`](geocoder.yml), [`drone-stack.yml`](drone-stack.yml))
- `*.js, *.rb`  
  Custom Resource Lambda function code. (e.g., [`ami-manager.js`](ami-manager.js), [`count_asg.js`](count_asg.js), [`vpcClassicLink.js`](vpcClassicLink.js), [`fast_snapshot_restore.rb`](fast_snapshot_restore.rb))
- `package.json`, `yarn.lock`, `test/*`  
Package definitions and test files related to Custom Resource Lambda functions.

## See also

- [`stack.rake`](../../lib/rake/stack.rake), [`adhoc.rake`](../../lib/rake/adhoc.rake)  
  Rakefiles implementing `stack:*` / `adhoc:*` commands for managing various CloudFormation stacks.
- [`AWS::CloudFormation`](../../lib/cdo/aws/cloud_formation.rb)  
  Class managing configuration and deployment of AWS CloudFormation stacks.
- [`Cdo::CloudFormation::StackTemplate`](../../lib/cdo/cloud_formation/stack_template.rb)  
  Controller class providing the ERB binding context for CloudFormation stack templates.
- [`Cdo::CloudFormation::CdoApp`](../../lib/cdo/cloud_formation/cdo_app.rb)  
  Stack-template controller specific to the monolithic Code.org application stack.

## Specific Template/Stack Notes

### IAM

The IAM stack is deployed manually by an AWS Admin. Best practice is to create a PR, obtain approval, then attempt the deployment before merging. If there are issues, fix them in the PR and only merge the PR after the code is known to be good.

To validate the "iam.yml.erb" template:

```
export AWS_PROFILE=codeorg-admin
# optionally prefix the following with VERBOSE=1
bundle exec rake stack:iam:validate RAILS_ENV=production
unset AWS_PROFILE
```

To update the stack, you will need to set the `ADMIN` environment variable to [change the role](https://github.com/code-dot-org/code-dot-org/blob/staging/lib/cdo/aws/cloud_formation.rb#L207) executing the change.

```
export AWS_PROFILE=codeorg-admin
ADMIN=1 bundle exec rake stack:iam:start RAILS_ENV=production
unset AWS_PROFILE
```

### domain_redirect

"domain_redirect.yml.erb" describes a generic domain redirect stack, and is used with "domain_redirect_deploy.sh"
