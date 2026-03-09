Deploys AWS resources for the Gen AI Curriculum. These include SageMaker models, endpoint configurations, and endpoints.

### Usage:
```
./deploy_gen_ai_curriculum_stack [-e | --environment] [-d | --dry-run] [-i | --image-uri] [-t | --huggingface-token]
```

The script will prompt for any missing required inputs.

### Options:
    -e, --environment
        Specifies the environment for the stack. Valid options are 'production' or 'test'.
        The 'production' stack creates endpoints that are used by our production servers, for production use. These endpoints have higher instances counts and autoscale based on traffic.
        The 'test' stack creates endpoints that are used in all other non-prod environments (staging, test, adhoc, levelbuilder, localhost). These endpoints only run on a single instance with no autoscaling to minimize cost.
    
    -d, --dry-run
        If specified, runs the script in dry run mode which only outputs the generated template, without running the command to deploy the stack.
    
    -i, --image-uri
        Use a specific HuggingFace Image URI for deploying models. Will use a default if not specified.
        For most deployments, you shouldn't need to specify this (use the default). Instructions for generating a new image URI using the SageMaker Python library are printed in the script.

    -t, --huggingface-token
        Read-access HuggingFace token to use for model configuration.
        TODO: Get this from AWS Secrets if not specified.

### Files:
- [deploy_gen_ai_curriculum_stack](./deploy_gen_ai_curriculum_stack): deploy script. Collects inputs, converts ERB template to YML, and deploys the CloudFormation stack (if dry-run is false).
- [gen_ai_curriculum.yml.erb](./gen_ai_curriculum.yml.erb): Template ERB script that gets converted to YAML by the deploy script. ERB is used to programmatically generate the various resource configurations for each model/endpoint.
- [config.rb](./config.rb): Configuration for each endpoint/model. See file for details on what parameters are specified. This configuration is used in the template ERB file.

### When to Deploy:
The resources deployed by this stack aren't directly affected by main repo code changes, so they can be deployed ad-hoc. Typically, we will redeploy this stack if some configuration changes, such as changing the number of instances, instance type, autoscaling thresholds, etc.
