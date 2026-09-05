# /cloudformation

This directory contains CloudFormation stack templates, associated Custom Resource Lambda functions, and some other related scripts and configuration.

- [`cloud_formation_stack.yml.erb`](cloud_formation_stack.yml.erb) - Stack template for the monolithic Code.org application.
- `*.yml`, `*.yml.erb` (e.g., [vpc.yml.erb](vpc.yml.erb), [iam.yml.erb](iam.yml.erb), [data.yml.erb](data.yml.erb), [lambda.yml.erb](lambda.yml.erb), [alerting.yml.erb](alerting.yml.erb), [`geocoder.yml`](geocoder.yml), [`drone-stack.yml`](drone-stack.yml)) - Various other standalone or service-oriented stack templates.
- `*.js, *.rb` (e.g., [`ami-manager.js`](ami-manager.js), [`count_asg.js`](count_asg.js), [`fast_snapshot_restore.rb`](fast_snapshot_restore.rb)) - Custom Resource Lambda function code.
- `package.json`, `yarn.lock`, `test/*` -  Package definitions and test files related to Custom Resource Lambda functions.

## See also

- [`stack.rake`](../../lib/rake/stack.rake), [`adhoc.rake`](../../lib/rake/adhoc.rake) - Rakefiles implementing `stack:*` / `adhoc:*` commands for managing various CloudFormation stacks.
- [`AWS::CloudFormation`](../../lib/cdo/aws/cloud_formation.rb) - Class managing configuration and deployment of AWS CloudFormation stacks.
- [`Cdo::CloudFormation::StackTemplate`](../../lib/cdo/cloud_formation/stack_template.rb) - Controller class providing the ERB binding context for CloudFormation stack templates.
- [`Cdo::CloudFormation::CdoApp`](../../lib/cdo/cloud_formation/cdo_app.rb) - Stack-template controller specific to the monolithic Code.org application stack.

## Testing Out CloudFormation Templates Old and New

So you've changed a cloudformation template, call it 'template.yml', or created a new one. How do you test your changes without affecting production services?

First, consult [Specific Template/Stack Notes](#specific-template-stack-notes) to see if there are any for your stack of interest.

### If you have a .yml.erb file

All `*.yml.erb` templates in this directory are rendered and deployed through
rake tasks defined in [`lib/rake/stack.rake`](../../lib/rake/stack.rake). The
table below maps each template to its tasks. Many of these stacks deploy
rarely, so drift between the template and the live stack is likely.

**Always lint and validate before `:start`.** The linter (`cfn-lint`) catches
schema problems; `:validate` asks AWS to parse the rendered template against
the live account. Skipping these on a rarely-touched stack is how a small
template edit becomes an outage.

| Template | Rake namespace | Scope | Deployed stack name(s) | Notes |
|---|---|---|---|---|
| [`lambda.yml.erb`](lambda.yml.erb) | `stack:lambda` | Single (account-wide) | `lambda` | Admin-only. `:start` requires `ADMIN=1`. See file header. |
| [`alerting.yml.erb`](alerting.yml.erb) | `stack:alerting` | Single (account-wide) | `alerting` | |
| [`vpc.yml.erb`](vpc.yml.erb) | `stack:vpc` | Single (account-wide) | `VPC` | |
| [`iam.yml.erb`](iam.yml.erb) | `stack:iam` | Single (account-wide) | `IAM` | Admin-only. `:start` requires `ADMIN=1`. See [IAM](#iam) section. |
| [`data.yml.erb`](data.yml.erb) | `stack:data` | Per-environment | `DATA-<rack_env>` (e.g. `DATA-production`, `DATA-staging`, `DATA-test`) | Run `:start` once per environment, varying `RAILS_ENV`. |
| [`cloud_formation_stack.yml.erb`](cloud_formation_stack.yml.erb) | `stack:start` | Per-deploy | `STACK_NAME` value (production, staging, test, adhocs) | Monolithic app stack; primarily driven by `adhoc:*` / `stack:*` from [`lib/rake/adhoc.rake`](../../lib/rake/adhoc.rake). |
| [`domain_redirect.yml.erb`](domain_redirect.yml.erb) | n/a | Per-domain group | operator-named | Rendered+linted+validated by [`domain_redirect.sh`](domain_redirect.sh); operator then uploads the YAML manually in the AWS Console. See file header. |

**Scope key:**

- **Single (account-wide)** — exactly one live stack per AWS account. `RAILS_ENV`
  still selects which config block is rendered into the template, but the
  deployed AWS stack name is the same regardless. Convention is
  `RAILS_ENV=production` since these stacks back production services.
- **Per-environment** — one live stack per `rack_env` value. `:start` must
  be run once per environment you intend to update; `RAILS_ENV` selects both
  the config block *and* the target stack name.
- **Per-deploy** — caller supplies `STACK_NAME` (adhocs, plus the named
  production/staging/test deploys).

Standard sequence for any single (account-wide) stack — substitute the namespace:

```bash
export AWS_PROFILE=codeorg-admin   # or codeorg-dev for non-prod experiments
bundle exec rake stack:<name>:lint     RAILS_ENV=production
bundle exec rake stack:<name>:validate RAILS_ENV=production
bundle exec rake stack:<name>:start    RAILS_ENV=production   # prepend ADMIN=1 for iam, lambda
unset AWS_PROFILE
```

For per-environment stacks, run the full sequence once per environment, e.g.
for `data`:

```bash
export AWS_PROFILE=codeorg-admin
for env in production staging test; do
  bundle exec rake stack:data:lint     RAILS_ENV=$env
  bundle exec rake stack:data:validate RAILS_ENV=$env
  bundle exec rake stack:data:start    RAILS_ENV=$env
done
unset AWS_PROFILE
```

Useful env vars honored by all of the above: `VERBOSE=1`, `QUIET=1`,
`TEMPLATE=<path>` (override the default `<stack>.yml.erb`), `STACK_NAME=<name>`
(override the default deployed name), `IMPORT_RESOURCES=1`.

Each `.yml.erb` should carry a short ERB-comment header (`<%# ... %>`) with
its specific deploy invocation; that header is the source of truth when the
table above and reality disagree.

### If you have a .yml file

Most .yml files (see Exceptions below) are straight forward to deploy and test :

- Login to the __codeorg-dev__ AWS account
- Select your region, Oregon suggested
- Go to CloudFormation->Stacks
- Click Create Stack->With New Resources
- Select the "Upload a template file" option
- Upload a template file: click "Choose File" button and select your template.yml file
- Click the Next button to go to the Parameters page
- Set "Stack name" to a unique descriptive name for your deploy (a branch?)
- Fill in any other parameters as appropriate and specific to your particular template which defines them. Some of the params may require research to figure out.
- Add the tag "created_by" with your email as the value
- Click "Next" a few times then "Submit" to start your stack creating
- Remember to come back and delete the stack when you're finished testing

#### Exceptions

Incomplete list of .yml files may require a script to regenerate or test:

- access_logs.yml

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

"domain_redirect.yml.erb" describes a generic domain redirect stack, and is used with "domain_redirect.sh". See the ERB header in the template for the exact invocation; the script renders, lints, and validates but does not deploy — the operator then uploads the rendered YAML manually in the AWS Console.
