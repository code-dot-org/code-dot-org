# bootstrapped-aws-secret

This pattern lets people applying your module:
1. Set an optional variable? value is uploaded to an AWS Secrets Manager secret
1. Variable not set? value is read from AWS Secrets Manager

And its easy for module authors to implement, see below:

## Example usage:

```hcl

# People can set this once and `tofu apply` to boostrap the secret to AWS Secrets Manager
variable "my_secret_api_token" {
  description = "Optional: api_token for my secret inc, defaults to reading from AWS Secrets Manager. Set variable and apply once to upload/boostrap it."
  type      = string
  sensitive = true
  default   = null
}

# Reference your secret throughout your module as `locals.my_secret_api_token`
locals {
  my_secret_api_token = module.my_secret_api_token.secret_value
}

# Does the upload if var is set, or reads the value if its now
module "my_secret_api_token" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name           = "k8s/tofu/my_secret_api_token"
  secret_value_to_bootstrap = var.my_secret_api_token
}

```

## Bootstrap with a randomly generated password

Sometimes you just want to generate a password and upload it, this is supported too:

```hcl

module "my_secret_api_token" {
  source = "../../modules/bootstrapped-aws-secret"

  aws_secret_name             = "k8s/tofu/my_secret_api_token"
  bootstrap_with_random_value = true
}
