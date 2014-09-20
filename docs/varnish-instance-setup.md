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

- Create `~/.ssh/id_rsa`<pre>-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAyw6GpuCmXbTRSEh4EZ1gDEy45D6ZLi5EPm+rrI+zUG3qAWAQ
w78FwjPmKZDRmLmxmVF1GrRipdOP8QDoHcKxICOOur7cKo7ga3e3iFTQ0nYlt3Qx
OMWQUgwpoDn2RLaOFeotwTHU48x1isB8M06EQWRXT0q9EQcsiWeF7Ry43lj/YUf9
1CKsVAQ74JCSLrqQVPKWwLLxgtTQlqICmAJtJLLXwojKvz8bafZpjBX5bKGi9T5D
SwvICvozvqVuhTs++ohd0JYUFxieEUNe9EjvAAvpmtUz7KPzz3uA77HsF1D8ZDmc
HES3RpZmCrRLSyAAj9MqA63AR85Hdxniz5z4mwIDAQABAoIBACalUBlInkEtXbtt
F3T6x8HvhCzkgRDZ+2EKrdi8zLrdAHFckDRBEd6BNCfrCQkRJmzwpOH9PN0ko7uR
mZu4Zy+ftNVz58EtyiaJ9WM8CTZVCB6fPZL5ftsut2loPqebOvWOyUCAtGzah/Bt
a/Xz1pX/e+J6bftkqyRHkKStF74xSPms4ujrWMM25Y/+Uzm3WHsTN147mHx6FDKo
qZ8iwe9XezFRXOaXbgq7VzD96fcxMYGoh3o5qSRlNAWD84Q9fBs42UYvhqLFn+77
BqO/b7I/bI2n8DwZyObOP/O+wZVOtU63drohC5JryQuhAfX2jL7Mk+9cUYWW2qNL
XiveG9kCgYEA9cTVK7theaR1tCFeEzTiwSKOsTIEji1EdtGLhQs2aEb45OAGFt8V
m6ORWULNRG/4OaGnK0OXK0lKcC59mAcHazvXpvgisUcLXsXydg7Ve9+tZn9haZyB
sCeloQSMOZxUxVglueNupMXfScI+N/WRM/GRsC7UiOTy02VL9VE93e8CgYEA04KC
M7Gimk02De/soG4E//l7gti71lSg8OVa3yr4XuJA8mV3BRIhz11yLiRwz/lqaG0u
7hpbCA6Ah2Q77jcV6oMrr5RF4x/tVoPsSWgGdNYhVUuXoMVeUYSXkVn8ES2qAKDi
Pyof/I1+njGOE68IjjzR879K8a/63xnUTRyWfBUCgYBAxXdI50FxRZ6fsouQlEeO
jwT8PiplLhj1F5Slo6bbJJlD+KaiMHkJY7pSxABFIR1SUwAzrsSQa+hqWFZRUsjp
wgO7xXmfLxIYECMuagppczHH6ZpKsyyauFg2b3RlWoYc3HZU31OxqVSHo+Gx7c4u
2mODA1SQH4a/n9q89IRRkQKBgGfz0q45deNEY3bCHphSul5cbZnHj7otadQ7xUe9
xMhNhwIbYD27xaY3FTEcc92jherBDrmzdl4lUoI4f0P7Cuhxg30N8LNKM8m7mNwT
Jmkx/LwBJQq9Njf2ZM/pW/vNZ6pbaBcHSyVDHaH+VQfTlO7jcYTM1baneTNBbJhh
noxpAoGBAKuevpjgXdoBS5sUGSGqsD6wBnK8KyoF5jBc2Yj/QGKW99i3ZK06haI0
0IFt6uI5AqpB0V4U9yV3uBtVjBL2QQSoheLuM7tS38+9JhLVy1ySIFaAG6a9HTtd
IhQNTvPrfLxx++0/ey3R6WJ/NMkFYDtXQQjWnvz8fyomQL3paabb
-----END RSA PRIVATE KEY-----</pre>

- Create `~/.ssh/id_rsa.pub`<pre>ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDLDoam4KZdtNFISHgRnWAMTLjkPpkuLkQ+b6usj7NQbeoBYBDDvwXCM+YpkNGYubGZUXUatGKl04/xAOgdwrEgI466vtwqjuBrd7eIVNDSdiW3dDE4xZBSDCmgOfZEto4V6i3BMdTjzHWKwHwzToRBZFdPSr0RByyJZ4XtHLjeWP9hR/3UIqxUBDvgkJIuupBU8pbAsvGC1NCWogKYAm0kstfCiMq/Pxtp9mmMFflsoaL1PkNLC8gK+jO+pW6FOz76iF3QlhQXGJ4RQ170SO8AC+ma1TPso/PPe4DvsewXUPxkOZwcRLdGlmYKtEtLIACP0yoDrcBHzkd3GeLPnPib ubuntu@code.org</pre>

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

