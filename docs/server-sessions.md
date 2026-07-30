# Server sessions

Shell access to managed application servers is controlled by [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html), which uses AWS credentials to start shell sessions through the [`StartSession`](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_StartSession.html) API command.

## AWS Console access

You can connect to a server from your browser through the [Amazon EC2 console](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#start-ec2-console) by clicking the 'Connect' button from the EC2 Instances page.

## Command-line Access

In order to connect to a Session Manager Session using the AWS Command Line Interface, you need to first [install the plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html). (You may also need to [install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html), or upgrade to v1.16.12 or later.)

To connect to an named EC2 instance using the CLI, you can use the [`ssm`](../bin/ssm) helper script, which will help start a running instance by Name (tag).

(Optional) You may also install the [`ssm-completion`](../bin/ssm-completion) bash completion script by copying it into the [`bash-completion`]() config directory (e.g., `/etc/bash_completion.d/`). The script will enable tab-completion on `ssm` for all running EC2 instance-ids and Name (tag) values.

## Port Forwarding

### Background

[Port Forwarding](https://help.ubuntu.com/community/SSH/OpenSSH/PortForwarding) is an SSH feature that allows you to use a session as a tunnel for traffic to arbitrary services (e.g., a database listening on port 3306, or an HTTP server listening on port 80), on any host the remote server can access over its network. Port forwarding is typically used to control access to services not exposed to the public Internet by routing traffic forwarded over SSH through a central [Bastion Host](https://en.wikipedia.org/wiki/Bastion_host) ('gateway'), which listens to a public SSH port and also has access to the internal network.

### Port Forwarding in Session Manager

Session Manager [supports Port Forwarding sessions](https://aws.amazon.com/blogs/aws/new-port-forwarding-using-aws-system-manager-sessions-manager/) with a special `AWS-StartPortForwardingSession` document.

However, it currently only lets you access services running on the EC2 instance itself (no forwarding ports from other reachable services in the network), and only supports a single open connection per forwarded port.

For these reasons it's generally more convenient to use SSH connections through Session Manager to access internal network services.

## SSH Connections through Session Manager

Session Manager [supports SSH connections](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html) by forwarding the SSH port (22) through a Session Manager connection. Session Manager provides a special `AWS-StartSSHSession` document for this use-case.

The best way to configure SSH connections through Session Manager is to add an entry in your local ssh config (`~/.ssh/config`) with a `ProxyCommand` that calls the `ssm-ssh` helper script:

```ssh
# SSH connection to EC2 instances through Session Manager.
Match host i-*
  ProxyCommand sh -c "ssm-ssh %h %p %r ~/.ssh/ssm_key"
  User ubuntu
  IdentityFile ~/.ssh/ssm_key

  # Any SSH Port Forwarding configuration will also work here, e.g.:
  LocalForward 3307 db-reporting.code.org:3306
  LocalForward 8080 localhost:8080

```

With this configuration, all you need to do is run `ssh [instance-id]` and it should establish an SSH connection to the remote instance.
