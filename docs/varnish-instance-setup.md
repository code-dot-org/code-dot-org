# Varnish Instance Setup

This document describes how to build a Varnish instance from scratch.

## Caveats

These instructions use RVM to install Ruby instead of RBENV; follow these instructions.  Although we want to use RBENV on the next build-out [@Geoffrey](geoffrey@code.org) messed upand used RVM here and we need the machines to be identical.

## 1. Launch a new EC2 instance

- Select the `m3.large` instance size.
- Select the `Ubuntu 14.04 AMI`
- Select the `pegasus-varnish` security group.

## 2. Update the instance and restart

- `ssh` to the instance
- `sudo aptitude update`
- `sudo aptitude full-upgrade -y`
- `sudo init 6`

## 3. Install Ruby

- `ssh` to the instance
- `\curl -sSL https://get.rvm.io | bash`
- `source /home/ubuntu/.rvm/scripts/rvm`
- `rvm install 2.0.0`

## 4. Install Git

- `ssh` to the instance

- Create `~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub` with the dev@code.org keys from <https://github.com/settings/ssh>

- `chmod 600 ~/.ssh/id_rsa*`
- `sudo aptitude install -y git`
- `git config --global user.name "Continuous Integration"`
- `git config --global user.email dev@code.org`
- `git config --global push.default simple`

## 5. Clone Website-CI

- `ssh` to the instance
- `git clone git@github.com:code-dot-org/website-ci.git`
- `cd website-ci`
- `git checkout master`
- `cd aws`
- `bundle`
- `cd ..`

## 6. Configure and Install Varnish

- `ssh` to the instance

- Edit `config.yml` and add this host:<pre>&lt;HOST_NAME&gt;:
    env: 'production'
    name: '&lt;DISPLAY_NAME&gt;'
    dns: '&lt;PUBLIC_DNS_ADDRESS&gt;'
    varnish_backends:
      1c: '174.129.126.179'
      1d: '54.80.85.226'
    varnish_storage: 'malloc,6.0G'
</pre>

- `cd setup`

- `rake varnish`

- Visit http://&lt;PUBLIC_DNS_ADDRESS&gt; using a web browser; you should see the main Code.org site.

## 7. Add the Instance to the Zone's Load Balancer

## 8. Verify Traffic is reaching the instance

- `ssh` to the instance
- `varnishstat`
- Watch for traffic to appear
- Press &lt;CTRl-C&gt; or `q` to quit

