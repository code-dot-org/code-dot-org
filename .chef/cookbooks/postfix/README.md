postfix Cookbook
================
Installs and configures postfix for client or outbound relayhost, or to do SASL authentication.

On RHEL-family systems, sendmail will be replaced with postfix.


Requirements
------------
### Platforms
- Ubuntu 10.04+
- Debian 6.0+
- RHEL/CentOS/Scientific 5.7+, 6.2+
- Amazon Linux (as of AMIs created after 4/9/2012)

May work on other platforms with or without modification.


Attributes
----------
See `attributes/default.rb` for default values.

### Generic cookbook attributes
* `node['postfix']['mail_type']` - Sets the kind of mail configuration. `master` will set up a server (relayhost).
* `node['postfix']['relayhost_role']` - name of a role used for search in the client recipe.
* `node['postfix']['multi_environment_relay']` - set to true if nodes should not constrain search for the relayhost in their own environment.
* `node['postfix']['use_procmail']` - set to true if nodes should use procmail as the delivery agent.
* `node['postfix']['use_alias_maps']` - set to true if you want the cookbook to use/configure alias maps
* `node['postfix']['use_transport_maps']` - set to true if you want the cookbook to use/configure transport maps
* `node['postfix']['use_access_maps']` - set to true if you want the cookbook to use/configure access maps
* `node['postfix']['use_virtual_aliases']` - set to true if you want the cookbook to use/configure virtual alias maps
* `node['postfix']['use_relay_restrictions_maps']` - set to true if you want the cookbook to use/configure a list of domains to which postfix will allow relay
* `node['postfix']['aliases']` - hash of aliases to create with `recipe[postfix::aliases]`, see below under __Recipes__ for more information.
* `node['postfix']['transports']` - hash of transports to create with `recipe[postfix::transports]`, see below under __Recipes__ for more information.
* `node['postfix']['access']` - hash of access to create with `recipe[postfix::access]`, see below under __Recipes__ for more information.
* `node['postfix']['virtual_aliases']` - hash of virtual_aliases to create with `recipe[postfix::virtual_aliases]`, see below under __Recipes__ for more information.
* `node['postfix']['main_template_source']` - Cookbook source for main.cf template. Default 'postfix'
* `node['postfix']['master_template_source']` - Cookbook source for master.cf template. Default 'postfix'

### main.cf and sasl\_passwd template attributes
The main.cf template has been simplified to include any attributes in the `node['postfix']['main']` data structure.  The following attributes are still included with this cookbook to maintain some semblance of backwards compatibility.

This change in namespace to `node['postfix']['main']` should allow for greater flexibility, given the large number of configuration variables for the postfix daemon.  All of these cookbook attributes correspond to the option of the same name in `/etc/postfix/main.cf`.

* `node['postfix']['main']['biff']` - (yes/no); default no
* `node['postfix']['main']['append_dot_mydomain']` - (yes/no); default no
* `node['postfix']['main']['myhostname']` - defaults to fqdn from Ohai
* `node['postfix']['main']['mydomain']` - defaults to domain from Ohai
* `node['postfix']['main']['myorigin']` - defaults to $myhostname
* `node['postfix']['main']['mynetworks']` - default is nil, which forces Postfix to default to loopback addresses.
* `node['postfix']['main']['inet_interfaces']` - set to `loopback-only`, or `all` for server recipe
* `node['postfix']['main']['alias_maps']` - set to `hash:/etc/aliases`
* `node['postfix']['main']['mailbox_size_limit']` - set to `0` (disabled)
* `node['postfix']['main']['mydestination']` - default fqdn, hostname, localhost.localdomain, localhost
* `node['postfix']['main']['smtpd_use_tls']` - (yes/no); default yes. See conditional cert/key attributes.
  - `node['postfix']['main']['smtpd_tls_cert_file']` - conditional attribute, set to full path of server's x509 certificate.
  - `node['postfix']['main']['smtpd_tls_key_file']` - conditional attribute, set to full path of server's private key
  - `node['postfix']['main']['smtpd_tls_CAfile']` - set to platform specific CA bundle
  - `node['postfix']['main']['smtpd_tls_session_cache_database']` - set to `btree:${data_directory}/smtpd_scache`
* `node['postfix']['main']['smtp_use_tls']` - (yes/no); default yes.  See following conditional attributes.
  - `node['postfix']['main']['smtp_tls_CAfile']` - set to platform specific CA bundle
  - `node['postfix']['main']['smtp_tls_session_cache_database']` - set to `btree:${data_directory}/smtpd_scache`
* `node['postfix']['main']['smtp_sasl_auth_enable']` - (yes/no); default no.  If enabled, see following conditional attributes.
  - `node['postfix']['main']['smtp_sasl_password_maps']` - Set to `hash:/etc/postfix/sasl_passwd` template file
  - `node['postfix']['main']['smtp_sasl_security_options']` - Set to noanonymous
  - `node['postfix']['main']['relayhost']` - Set to empty string
  - `node['postfix']['sasl']['smtp_sasl_user_name']` - SASL user to authenticate as.  Default empty
  - `node['postfix']['sasl']['smtp_sasl_passwd']` - SASL password to use.  Default empty.
* `node['postfix']['sender_canonical_map_entries']` - (hash with key value pairs); default not configured.  Setup generic canonical maps. See `man 5 canonical`. If has at least one value, then will be enabled in config.
* `node['postfix']['smtp_generic_map_entries']` - (hash with key value pairs); default not configured.  Setup generic postfix maps. See `man 5 generic`. If has at least one value, then will be enabled in config.

Example of json role config, for setup *_map_entries:

`postfix : {`

`...`

`"smtp_generic_map_entries" : { "root@youinternaldomain.local" : "admin@example.com", "admin@youinternaldomain.local" : "admin@example.com" }`

`}`

### master.cf template attributes
* `node['postfix']['master']['submission'] - Whether to use submission (TCP 587) daemon. (true/false); default false


Recipes
-------
### default
Installs the postfix package and manages the service and the main configuration files (`/etc/postfix/main.cf` and `/etc/postfix/master.cf`). See __Usage__ and __Examples__ to see how to affect behavior of this recipe through configuration. Depending on the `node['postfix']['use_alias_maps']`, `node['postfix']['use_transport_maps']`, `node['postfix']['use_access_maps']` and `node['postfix']['use_virtual_aliases']` attributes the default recipe can call additional recipes to manage additional postfix configuration files

For a more dynamic approach to discovery for the relayhost, see the `client` and `server` recipes below.

### client
Use this recipe to have nodes automatically search for the mail relay based which node has the `node['postfix']['relayhost_role']` role. Sets the `node['postfix']['main']['relayhost']` attribute to the first result from the search.

Includes the default recipe to install, configure and start postfix.

Does not work with `chef-solo`.

### sasl\_auth
Sets up the system to authenticate with a remote mail relay using SASL authentication.

### server
To use Chef Server search to automatically detect a node that is the relayhost, use this recipe in a role that will be relayhost. By default, the role should be "relayhost" but you can change the attribute `node['postfix']['relayhost_role']` to modify this.

**Note** This recipe will set the `node['postfix']['mail_type']` to "master" with an override attribute.

### aliases
Manage `/etc/aliases` with this recipe. Currently only Ubuntu 10.04 platform has a template for the aliases file. Add your aliases template to the `templates/default` or to the appropriate platform+version directory per the File Specificity rules for templates. Then specify a hash of aliases for the `node['postfix']['aliases']` attribute.

Arrays are supported as alias values, since postfix supports comma separated values per alias, simply specify your alias as an array to use this handy feature.

### aliases
Manage `/etc/aliases` with this recipe.

### transports
Manage `/etc/postfix/transport` with this recipe.

### access
Manage `/etc/postfix/access` with this recipe.

### virtual_aliases
Manage `/etc/postfix/virtual` with this recipe.

### relay_restrictions
Manage `/etc/postfix/relay_restriction` with this recipe
The postfix option smtpd_relay_restrictions in main.cf will point to this hash map db.  


http://wiki.chef.io/display/chef/Templates#Templates-TemplateLocationSpecificity


Usage
-----
On systems that should simply send mail directly to a relay, or out to the internet, use `recipe[postfix]` and modify the `node['postfix']['main']['relayhost']` attribute via a role.

On systems that should be the MX for a domain, set the attributes accordingly and make sure the `node['postfix']['mail_type']` attribute is `master`. See __Examples__ for information on how to use `recipe[postfix::server]` to do this automatically.

If you need to use SASL authentication to send mail through your ISP (such as on a home network), use `postfix::sasl_auth` and set the appropriate attributes.

For each of these implementations, see __Examples__ for role usage.


### Examples
The example roles below only have the relevant postfix usage. You may have other contents depending on what you're configuring on your systems.

The `base` role is applied to all nodes in the environment.

```ruby
name "base"
run_list("recipe[postfix]")
override_attributes(
  "postfix" => {
    "mail_type" => "client",
    "main" => {
      "mydomain" => "example.com",
      "myorigin" => "example.com",
      "relayhost" => "[smtp.example.com]",
      "smtp_use_tls" => "no"
    }
  }
)
```

The `relayhost` role is applied to the nodes that are relayhosts. Often this is 2 systems using a CNAME of `smtp.example.com`.

```ruby
name "relayhost"
run_list("recipe[postfix::server]")
override_attributes(
  "postfix" => {
    "mail_type" => "master",
    "main" => {
      "mynetworks" => [ "10.3.3.0/24", "127.0.0.0/8" ],
      "inet-interfaces" => "all",
      "mydomain" => "example.com",
      "myorigin" => "example.com"
  }
)
```

The `sasl_relayhost` role is applied to the nodes that are relayhosts and require authenticating with SASL. For example this might be on a household network with an ISP that otherwise blocks direct internet access to SMTP.

```ruby
name "sasl_relayhost"
run_list("recipe[postfix], recipe[postfix::sasl_auth]")
override_attributes(
  "postfix" => {
    "mail_type" => "master",
    "main" => {
      "mynetworks" => "10.3.3.0/24",
      "mydomain" => "example.com",
      "myorigin" => "example.com",
      "relayhost" => "[smtp.comcast.net]:587",
      "smtp_sasl_auth_enable" => "yes"
    },
    "sasl" => {
      "smtp_sasl_passwd" => "your_password",
      "smtp_sasl_user_name" => "your_username"
    }
  }
)
```

For an example of using encrypted data bags to encrypt the SASL password, see the following blog post:

* http://jtimberman.github.com/blog/2011/08/06/encrypted-data-bag-for-postfix-sasl-authentication/

#### Examples using the client & server recipes
If you'd like to use the more dynamic search based approach for discovery, use the server and client recipes. First, create a relayhost role.

```ruby
name "relayhost"
run_list("recipe[postfix::server]")
override_attributes(
  "postfix" => {
    "main" => {
      "mynetworks" => "10.3.3.0/24",
      "mydomain" => "example.com",
      "myorigin" => "example.com"
    }
  }
)
```

Then, add the `postfix::client` recipe to the run list of your `base` role or equivalent role for postfix clients.

```ruby
name "base"
run_list("recipe[postfix::client]")
override_attributes(
  "postfix" => {
    "mail_type" => "client",
    "main" => {
      "mydomain" => "example.com",
      "myorigin" => "example.com"
    }
  }
)
```

If you wish to use a different role name for the relayhost, then also set the attribute in the `base` role. For example, `postfix_master` as the role name:

```ruby
name "postfix_master"
description "a role for postfix master that isn't relayhost"
run_list("recipe[postfix::server]")
override_attributes(
  "postfix" => {
    "main" => {
      "mynetworks" => "10.3.3.0/24",
      "mydomain" => "example.com",
      "myorigin" => "example.com"
    }
  }
)
```

The base role would look something like this:

```ruby
name "base"
run_list("recipe[postfix::client]")
override_attributes(
  "postfix" => {
    "relayhost_role" => "postfix_master",
    "mail_type" => "client",
    "main" => {
      "mydomain" => "example.com",
      "myorigin" => "example.com"
    }
  }
)
```

To use relay restrictions override the relay restrictions attribute in this format:

```ruby
override_attributes(
  "postfix" => {
    "use_relay_restrictions_maps" => true,
    "relay_restrictions" => {
      "chef.io" => "OK",
      ".chef.io" => "OK",
      "example.com" => "OK"
    }
  }
)
```

License & Authors
-----------------
- Author:: Joshua Timberman <joshua@chef.io>

```text
Copyright:: 2009-2014, Chef Software, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
