# Notes

How do our frontends get built?

## WebServerAMI
WebServerAMI EC2 instance with a UserData script

```ruby
build_ami: erb_file(BOOTSTRAP_CHEF,
  resource_id: "AMICreate#{ami}",
  node_name: 'ami-$INSTANCE_ID',
  run_list: [CDO.chef_local_mode ? 'recipe[cdo-apps]' : 'role[unmonitored-frontend]'],
  commit: commit,
  daemon: false
),

BOOTSTRAP_CHEF = aws_dir('cloudformation/bootstrap_chef_stack.sh.erb')
```

This runs ["bootstrap_chef_stack.sh.erb"](aws/cloudformation/bootstrap_chef_stack.sh.erb) with those arguments

**This is very web server and ec2 focused, I don't think it want to try to run it on a docker container**


## FrontendLaunchConfiguration

The above is used as the AMI for a FrontentLaunchConfiguration, which has it's own UserData

```sh
STACK=${AWS::StackName}
REGION=${AWS::Region}
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
```

followed by this, injected from the main cfn template

```ruby
build_frontend: erb_file(aws_dir('cloudformation/bootstrap_frontend.sh.erb'),
  node_name: 'fe-$INSTANCE_ID',
  commit: commit
```

The ["bootstrap_frontend.sh.erb"](aws/cloudformation/bootstrap_frontend.sh.erb) file which just does some cleanup and health checking.

## So what have we learned?

Application setup is happening via chef, but I don't want to run all of chef. Can I get a list of what's being run and pick what makes sense to do in the docker container?

Are these just 'unmonitored-frontend' nodes with a run list of "cdo-apps"?

## Lets look through bootstrap_chef_stack for anything useful

1. Set a bunch of env variables that might be useful, though it's mostly chef stuff
2. I don't think we need to create an SSL cert
3. DO fetch database credentials from secrets manager
   1. what do for prod?
4. It builds first-boot.json, which has some values used by chef
   1. cdo-nginx (don't think i care about this)
   2. cdo-repository (we've already got this)
   3. cdo-secrets
      1. we need this to get chef secrets, but it mentions a possible depencency on cdo-repository (maybe it's enough to have the code?)
   4. cdo-apps
5. It installs chef and runs chef client with an empty run list
6. it get the chef config from aws secrets manager
7. it runs chef client again with the run list
8. it git resets to fix any files modified by the run list (seeding)

There's a LOT happening with cdo-apps. my options seem to be:
1. Run chef-client in docker and build something very close to production-daemon
2. Continue exploring the cookbooks and build something like production-daemon but dockery
3. Forget chef and just work to build only what's necessary for the "evaluate rubric job" to be worked by delayed_job

Backup plan should also be considered:
* How is production daemon performing today?
* What's the impact of a 100x increase in usage?
* Can we run more threads on production-daemon?

Temporary diversion:
* Cloudwatch metric for jobs table length, execution time, and total time.