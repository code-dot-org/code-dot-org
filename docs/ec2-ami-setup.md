# Dev server setup using the Amazon EC2 AMI

1. Launch an instance using the AMI identifier `ami-f56a739c`, or by [clicking here](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#LaunchInstanceWizard:ami=ami-f56a739c)
  * If you're a code.org security group member, you can choose your own public key
  * This can run on a micro instance, but it will occasionally be sluggish to load pages. A medium instance runs it comfortably.
2. Edit your EC2 instance's security group to allow access to ports 3000
3. `git pull` to update your code, and follow the Rails server setup instructions starting at step 6 in the main README
4. If you'd like to run your server as a daemon, start it with `bundle exec rails server -d`
  * You can restart it with: 
  ```
  kill `cat tmp/pids/server.pid`
  ```

## Custom subdomain

If you'd like to set a custom subdomain for your staging server, you can do that using AWS Route 53.

Go to the [Route 53 control panel](https://console.aws.amazon.com/route53/), double-click a
Hosted Zone (e.g., `code.org`), and click Create Record Set. Fill in the following values:

  * Type: CNAME
  * Name: `your-dev-subdomain.learn.code.org.`
  * Value: your EC2 subdomain, e.g., `ec2-[ip-address].compute-1.amazonaws.com`
  * All other fields can be left at their defaults
