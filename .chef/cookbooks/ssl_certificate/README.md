SSL Certificate Cookbook
==========================
[![Cookbook Version](https://img.shields.io/cookbook/v/ssl_certificate.svg?style=flat)](https://supermarket.chef.io/cookbooks/ssl_certificate)
[![GitHub Source](https://img.shields.io/badge/source-GitHub-blue.svg?style=flat)](https://github.com/zuazo/ssl_certificate-cookbook)
[![Dependency Status](http://img.shields.io/gemnasium/zuazo/ssl_certificate-cookbook.svg?style=flat)](https://gemnasium.com/zuazo/ssl_certificate-cookbook)
[![Code Climate](http://img.shields.io/codeclimate/github/zuazo/ssl_certificate-cookbook.svg?style=flat)](https://codeclimate.com/github/zuazo/ssl_certificate-cookbook)
[![Build Status](http://img.shields.io/travis/zuazo/ssl_certificate-cookbook/1.11.0.svg?style=flat)](https://travis-ci.org/zuazo/ssl_certificate-cookbook)
[![Circle CI](https://circleci.com/gh/zuazo/ssl_certificate-cookbook/tree/master.svg?style=shield)](https://circleci.com/gh/zuazo/ssl_certificate-cookbook/tree/master)

The main purpose of this [Chef](https://www.chef.io/) cookbook is to make it easy for other cookbooks to support SSL. With the resource included, you will be able to manage certificates reading them from attributes, data bags or chef-vaults. Exposing its configuration through node attributes.

Much of the code in this cookbook is heavily based on the SSL implementation from the [owncloud](https://supermarket.chef.io/cookbooks/owncloud) cookbook.

Table of Contents
=================

* [Requirements](#requirements)
  * [Supported Platforms](#supported-platforms)
  * [Required Applications](#required-applications)
* [Usage](#usage)
  * [Including the Cookbook](#including-the-cookbook)
  * [A Short Example](#a-short-example)
  * [Namespaces](#namespaces)
  * [Examples](#examples)
    * [Apache Examples](#apache-examples)
    * [Nginx Example](#nginx-example)
    * [Reading the Certificate from Attributes](#reading-the-certificate-from-attributes)
    * [Reading the Certificate from a Data Bag](#reading-the-certificate-from-a-data-bag)
    * [Reading the Certificate from Chef Vault](#reading-the-certificate-from-chef-vault)
    * [Reading the Certificate from Files](#reading-the-certificate-from-files)
    * [Reading the Certificate from Different Places](#reading-the-certificate-from-different-places)
    * [Creating a Certificate with Subject Alternate Names](#creating-a-certificate-with-subject-alternate-names)
    * [Reading Key, Certificate and Intermediary from a Data Bag](#reading-key-certificate-and-intermediary-from-a-data-bag)
    * [Creating a PKCS12 Containing Both the Certificate and the Private Key](#creating-a-pkcs12-containing-both-the-certificate-and-the-private-key)
    * [Creating a Certificate from a Certificate Authority](#creating-a-certificate-from-a-certificate-authority)
    * [Reading the CA Certificate from a Chef Vault Bag](#reading-the-ca-certificate-from-a-chef-vault-bag)
    * [Managing Certificates Via Attributes](#managing-certificates-via-attributes)
    * [Real-world Examples](#real-world-examples)
* [Attributes](#attributes)
  * [Service Attributes](#service-attributes)
* [Resources](#resources)
  * [ssl_certificate](#ssl_certificate)
    * [ssl_certificate Actions](#ssl_certificate-actions)
    * [ssl_certificate Parameters](#ssl_certificate-parameters)
* [Templates](#templates)
  * [Partial Templates](#partial-templates)
  * [Securing Server Side TLS](#securing-server-side-tls)
* [Testing](#testing)
  * [ChefSpec Matchers](#chefspec-matchers)
    * [ssl_certificate(name)](#ssl_certificatename)
    * [create_ssl_certificate(name)](#create_ssl_certificatename)
* [Contributing](#contributing)
* [TODO](#todo)
* [License and Author](#license-and-author)

Requirements
============

## Supported Platforms

This cookbook has been tested on the following platforms:

* Amazon Linux
* CentOS
* Debian
* Fedora
* FreeBSD
* Oracle Linux
* RedHat
* Scientific Linux
* Ubuntu
* Windows

Please, [let us know](https://github.com/zuazo/ssl_certificate-cookbook/issues/new?title=I%20have%20used%20it%20successfully%20on%20...) if you use it successfully on any other platform.

## Required Applications

* Chef `>= 11.14.2`.
* Ruby `2` or higher.

Usage
=====

## Including the Cookbook

You need to include this recipe in your `run_list` before using the  `ssl_certificate` resource:

```json
{
  "name": "example.com",
  "[...]": "[...]",
  "run_list": [
    "recipe[ssl_certificate]"
  ]
}
```

You can also include the cookbook as a dependency in the metadata of your cookbook:

```ruby
# metadata.rb
depends 'ssl_certificate'
```

One of the two is enough. No need to do anything else. Only use the `ssl_certificate` resource to create the certificates you need.

## A Short Example

```ruby
cert = ssl_certificate 'webapp1' do
  namespace node['webapp1'] # optional but recommended
end
# you can now use the #cert_path and #key_path methods to use in your
# web/mail/ftp service configurations
log "WebApp1 certificate is here: #{cert.cert_path}"
log "WebApp1 private key is here: #{cert.key_path}"
```

## Namespaces

The `ssl_certificate` resource **namespace** parameter is a node attribute path, like for example `node['example.com']`, used to configure SSL certificate defaults. This will make easier to *integrate the node attributes* with the certificate creation matters. This means you can configure the certificate creation through node attributes.

When a namespace is set in the resource, it will try to read the following attributes below the namespace (all attributes are **optional**):

| Attribute                                          | Description                    |
|:---------------------------------------------------|:-------------------------------|
| `namespace['common_name']`                         | Server name or *Common Name*, used for self-signed certificates (uses `node['fqdn']` by default).
| `namespace['country']`                             | *Country*, used for self-signed certificates.
| `namespace['city']`                                | *City*, used for self-signed certificates.
| `namespace['state']`                               | *State* or *Province* name, used for self-signed certificates.
| `namespace['organization']`                        | *Organization* or *Company* name, used for self-signed certificates.
| `namespace['department']`                          | Department or *Organizational Unit*, used for self-signed certificates.
| `namespace['email']`                               | *Email* address, used for self-signed certificates.
| `namespace['source']`                              | Attribute for setting certificate source and key source (both) to a value (`key_source` and `cert_source`).
| `namespace['bag']`                                 | Attribute for setting certificate bag and key bag (both) to a value (`key_bag` and `cert_bag`).
| `namespace['item']`                                | Attribute for setting certificate item name and key bag item name (both) to a value (`key_item` and `cert_item`).
| `namespace['encrypted']`                           | Attribute for setting certificate encryption and key encryption (both) to a value (`key_encryption` and `cert_encryption`).
| `namespace['secret_file']`                         | Attribute for setting certificate chef secret file and key chef secret file (both) to a value (`key_secret_file` and `cert_secret_file`).
| `namespace['ssl_key']['source']`                   | Source type to get the SSL key from. Can be `'self-signed'`, `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| `namespace['ssl_key']['path']`                     | File path of the SSL key.
| `namespace['ssl_key']['bag']`                      | Name of the Data Bag where the SSL key is stored.
| `namespace['ssl_key']['item']`                     | Name of the Data Bag Item where the SSL key is stored.
| `namespace['ssl_key']['item_key']`                 | Key of the Data Bag Item where the SSL key is stored.
| `namespace['ssl_key']['encrypted']`                | Whether the Data Bag where the SSL key is stored is encrypted.
| `namespace['ssl_key']['secret_file']`              | Secret file used to decrypt the Data Bag where the SSL key is stored.
| `namespace['ssl_key']['content']`                  | SSL key content used when reading from attributes.
| `namespace['ssl_cert']['source']`                  | Source type to get the SSL cert from. Can be `'self-signed'`, `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| `namespace['ssl_cert']['path']`                    | File path of the SSL certificate.
| `namespace['ssl_cert']['bag']`                     | Name of the Data Bag where the SSL cert is stored.
| `namespace['ssl_cert']['item']`                    | Name of the Data Bag Item where the SSL cert is stored.
| `namespace['ssl_cert']['item_key']`                | Key of the Data Bag Item where the SSL cert is stored.
| `namespace['ssl_cert']['encrypted']`               | Whether the Data Bag where the SSL cert is stored is encrypted.
| `namespace['ssl_cert']['secret_file']`             | Secret file used to decrypt the Data Bag where the SSL cert is stored.
| `namespace['ssl_cert']['content']`                 | SSL cert content used when reading from attributes.
| `namespace['ssl_cert']['subject_alternate_names']` | An array of Subject Alternate Names for the SSL cert. Needed if your site has multiple domain names on the same cert.
| `namespace['ssl_chain']['name']`                   | File name to be used for the intermediate certificate chain file. *If this is not present, no chain file will be written.*
| `namespace['ssl_chain']['source']`                 | Source type to get the intermediate certificate chain from. Can be `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| `namespace['ssl_chain']['path']`                   | File path of the intermediate SSL certificate chain.
| `namespace['ssl_chain']['bag']`                    | Name of the Data Bag where the intermediate certificate chain is stored.
| `namespace['ssl_chain']['item']`                   | Name of the Data Bag Item where the intermediate certificate chain is stored.
| `namespace['ssl_chain']['item_key']`               | Key of the Data Bag Item where the intermediate certificate chain is stored.
| `namespace['ssl_chain']['encrypted']`              | Whether the Data Bag where the intermediate certificate chain is stored is encrypted.
| `namespace['ssl_chain']['secret_file']`            | Secret file used to decrypt the Data Bag where the intermediate certificate chain is stored.
| `namespace['ssl_chain']['content']`                | Intermediate certificate chain content used when reading from attributes.
| `namespace['ca_cert_path']`                        | Certificate Authority full path.
| `namespace['ca_key_path']`                         | Key Authority full path.
| `namespace['pkcs12_path']`                         | Optional PKCS12 full path.
| `namespace['pkcs12_passphrase']`                   | Optional PKCS12 passphrase.

## Examples

### Apache Examples

Apache `web_app` example using community [apache2](https://supermarket.chef.io/cookbooks/apache2) cookbook and node attributes:

```ruby
node.default['my-webapp']['common_name'] = 'example.com'
node.default['my-webapp']['ssl_cert']['source'] = 'self-signed'
node.default['my-webapp']['ssl_key']['source'] = 'self-signed'

# we need to save the resource variable to get the key and certificate file
# paths
cert = ssl_certificate 'my-webapp' do
  # we want to be able to use node['my-webapp'] to configure the certificate
  namespace node['my-webapp']
  notifies :restart, 'service[apache2]'
end

include_recipe 'apache2'
include_recipe 'apache2::mod_ssl'
web_app 'my-webapp' do
  # this cookbook includes a virtualhost template for apache2
  cookbook 'ssl_certificate'
  server_name cert.common_name
  docroot # [...]
  # [...]
  ssl_key cert.key_path
  ssl_cert cert.cert_path
  ssl_chain cert.chain_path
end
```

Using custom paths:

```ruby
my_key_path = '/etc/keys/my-webapp.key'
my_cert_path = '/etc/certs/my-webapp.pem'

# there is no need to save the resource in a variable in this case because we
# know the paths
ssl_certificate 'my-webapp' do
  key_path my_key_path
  cert_path my_cert_path
end

# Configure Apache SSL
include_recipe 'apache2::mod_ssl'
web_app 'my-webapp' do
  cookbook 'ssl_certificate'
  # [...]
  ssl_key my_key_path
  ssl_cert my_cert_path
end
```

See [templates documentation](#templates).

### Nginx Example

Minimal `nginx` example using community [nginx](https://supermarket.chef.io/cookbooks/nginx) cookbook:

```ruby
cert = ssl_certificate 'my-webapp' do
  notifies :restart, 'service[nginx]'
end

# Create a virtualhost for nginx
template ::File.join(node['nginx']['dir'], 'sites-available', 'my-webapp-ssl') do
  # You need to create a template for nginx to enable SSL support and read the
  # keys from ssl_key and ssl_chain_combined attributes.
  # You can use the *nginx.erb* partial template as shown below.
  source 'nginx_vhost.erb'
  mode 00644
  owner 'root'
  group 'root'
  variables(
    name: 'my-webapp-ssl',
    server_name: 'ssl.example.com',
    docroot: '/var/www',
    # [...]
    ssl_key: cert.key_path,
    ssl_cert: cert.chain_combined_path
  )
  notifies :reload, 'service[nginx]'
end

# Enable the virtualhost
nginx_site 'my-webapp-ssl' do
  enable true
end

# publish the certificate to an attribute, it may be useful
node.set['web-app']['ssl_cert']['content'] = cert.cert_content
```

Here's a nginx template example using the [*nginx.erb* partial template](#partial-templates):

```erb
<%# nginx_vhost.erb %>
server {
  server_name <%= @server_name %>;
  listen 443;
  # Path to the root of your installation
  root <%= @docroot %>;

  access_log <%= node['nginx']['log_dir'] %>/<%= @name %>-access.log combined;
  error_log  <%= node['nginx']['log_dir'] %>/<%= @name %>-error.log;

  index index.html;
  <%# [...] %>

  <%= render 'nginx.erb', cookbook: 'ssl_certificate' %>
}
```

See [templates documentation](#templates).

### Reading the Certificate from Attributes

The SSL certificate can be read from an attribute directly:

```ruby
# Setting the attributes
node.default['mysite']['ssl_key']['content'] =
  '-----BEGIN PRIVATE KEY-----[...]'
node.default['mysite']['ssl_cert']['content'] =
  '-----BEGIN CERTIFICATE-----[...]'

# Creating the certificate
ssl_certificate 'mysite' do
  common_name 'cloud.mysite.com'
  namespace node['mysite']
  # this will read the node['mysite']['ssl_key']['content'] and
  # node['mysite']['ssl_cert']['content'] keys
  source 'attribute'
end
```

Alternative example using a namespace and node attributes:

```ruby
# Setting the attributes
node.default['mysite']['common_name'] = 'cloud.mysite.com'
node.default['mysite']['ssl_key']['source'] = 'attribute'
node.default['mysite']['ssl_key']['content'] =
  '-----BEGIN PRIVATE KEY-----[...]'
node.default['mysite']['ssl_cert']['source'] = 'attribute'
node.default['mysite']['ssl_cert']['content'] =
  '-----BEGIN CERTIFICATE-----[...]'

# Creating the certificate
ssl_certificate 'mysite' do
  namespace node['mysite']
end
```

### Reading the Certificate from a Data Bag

```ruby
ssl_certificate 'mysite' do
  common_name 'cloud.mysite.com'
  source 'data-bag'
  bag 'ssl_data_bag'
  key_item 'key' # data bag item
  key_item_key 'content' # data bag item json key
  cert_item 'cert'
  cert_item_key 'content'
  encrypted true
  secret_file '/path/to/secret/file' # optional
end
```

Alternative example using a namespace and node attributes:

```ruby
# Setting the attributes
node.default['mysite']['common_name'] = 'cloud.mysite.com'

node.default['mysite']['ssl_key']['source'] = 'data-bag'
node.default['mysite']['ssl_key']['bag'] = 'ssl_data_bag'
node.default['mysite']['ssl_key']['item'] = 'key'
node.default['mysite']['ssl_key']['item_key'] = 'content'
node.default['mysite']['ssl_key']['encrypted'] = true
node.default['mysite']['ssl_key']['secret_file'] = '/path/to/secret/file'

node.default['mysite']['ssl_cert']['source'] = 'data-bag'
node.default['mysite']['ssl_cert']['bag'] = 'ssl_data_bag'
node.default['mysite']['ssl_cert']['item'] = 'key'
node.default['mysite']['ssl_cert']['item_key'] = 'content'
node.default['mysite']['ssl_cert']['encrypted'] = true
node.default['mysite']['ssl_cert']['secret_file'] = '/path/to/secret/file'

# Creating the certificate
ssl_certificate 'mysite' do
  namespace node['mysite']
end
```

### Reading the Certificate from Chef Vault

```ruby
ssl_certificate 'mysite' do
  common_name 'cloud.mysite.com'
  source 'chef-vault'
  bag 'ssl_vault_bag'
  key_item 'key' # data bag item
  key_item_key 'content' # data bag item json key
  cert_item 'cert'
  cert_item_key 'content'
end
```

The same example, using a namespace and node attributes:

```ruby
# Setting the attributes
node.default['mysite']['common_name'] = 'cloud.mysite.com'

node.default['mysite']['ssl_key']['source'] = 'chef-vault'
node.default['mysite']['ssl_key']['bag'] = 'ssl_vault_bag'
node.default['mysite']['ssl_key']['item'] = 'key'
node.default['mysite']['ssl_key']['item_key'] = 'content'

node.default['mysite']['ssl_cert']['source'] = 'chef-vault'
node.default['mysite']['ssl_cert']['bag'] = 'ssl_vault_bag'
node.default['mysite']['ssl_cert']['item'] = 'key'
node.default['mysite']['ssl_cert']['item_key'] = 'content'

# Creating the certificate
ssl_certificate 'mysite' do
  namespace node['mysite']
end
```

### Reading the Certificate from Files

```ruby
ssl_certificate 'mysite' do
  common_name 'cloud.mysite.com'
  source 'file'
  key_path '/path/to/ssl/key'
  cert_path '/path/to/ssl/cert'
end
```

The same example, using a namespace and node attributes:

```ruby
# Setting the attributes
node.default['mysite']['common_name'] = 'cloud.mysite.com'

node.default['mysite']['ssl_key']['source'] = 'file'
node.default['mysite']['ssl_key']['path'] = '/path/to/ssl/key'

node.default['mysite']['ssl_cert']['source'] = 'file'
node.default['mysite']['ssl_cert']['path'] = '/path/to/ssl/cert'

# Creating the certificate
ssl_certificate 'mysite' do
  namespace node['mysite']
end
```

### Reading the Certificate from Different Places

You can also read the certificate and the private key from different places each:

```ruby
ssl_certificate 'mysite' do
  common_name 'cloud.mysite.com'

  # Read the private key from chef-vault
  key_source 'chef-vault'
  key_bag 'ssl_vault_bag'
  key_item 'key' # data bag item
  key_item_key 'content' # data bag item json key

  # Read the public cert from a non-encrypted data bag
  cert_source 'data-bag'
  cert_bag 'ssl_data_bag'
  cert_item 'cert'
  cert_item_key 'content'
  cert_encrypted false
end
```

The same example, using a namespace and node attributes:

```ruby
# Setting the attributes
node.default['mysite']['common_name'] = 'cloud.mysite.com'

# Read the private key from chef-vault
node.default['mysite']['ssl_key']['source'] = 'chef-vault'
node.default['mysite']['ssl_key']['bag'] = 'ssl_vault_bag'
node.default['mysite']['ssl_key']['item'] = 'key'
node.default['mysite']['ssl_key']['item_key'] = 'content'

# Read the public cert from a non-encrypted data bag
node.default['mysite']['ssl_cert']['source'] = 'data-bag'
node.default['mysite']['ssl_cert']['bag'] = 'ssl_data_bag'
node.default['mysite']['ssl_cert']['item'] = 'key'
node.default['mysite']['ssl_cert']['item_key'] = 'content'
node.default['mysite']['ssl_cert']['encrypted'] = false

# Creating the certificate
ssl_certificate 'mysite' do
  namespace node['mysite']
end
```

### Creating a Certificate with Subject Alternate Names

```ruby
domain = 'mysite.com'
# SAN for mysite.com, foo.mysite.com, bar.mysite.com, www.mysite.com
node.default[domain]['ssl_cert']['subject_alternate_names'] =
  [domain, "foo.#{domain}", "bar.#{domain}", "www.#{domain}"]

ssl_certificate 'mysite.com' do
  namespace node[domain]
  key_source 'self-signed'
  cert_source 'self-signed'
end
```

The *subject_alternate_names* parameter adds *DNS* values by default. You can also include other kind of values using a colon to separate the type from the value:

```ruby
domain = 'mysite.com'
node.default[domain]['email'] = 'email@example.com'
node.default[domain]['ssl_cert']['subject_alternate_names'] =
  [
    'email:copy',
    "email:my@#{domain}",
    "URI:http://#{domain}/",
    'IP:192.168.7.1',
    'IP:13::17',
    'RID:1.2.3.4',
    'otherName:1.2.3.4;UTF8:some other identifier'
  ]

ssl_certificate 'mysite.com' do
  namespace node[domain]
  key_source 'self-signed'
  cert_source 'self-signed'
end
```

See the [x509v3_config manual page](https://www.openssl.org/docs/apps/x509v3_config.html#Subject-Alternative-Name) for more information.

### Reading Key, Certificate and Intermediary from a Data Bag

```ruby
cert_name = 'chain-data-bag'
node.default[cert_name]['ssl_key']['source'] = 'data-bag'
node.default[cert_name]['ssl_key']['bag'] = 'ssl'
node.default[cert_name]['ssl_key']['item'] = 'key'
node.default[cert_name]['ssl_key']['item_key'] = 'content'
node.default[cert_name]['ssl_key']['encrypted'] = true
node.default[cert_name]['ssl_cert']['source'] = 'data-bag'
node.default[cert_name]['ssl_cert']['bag'] = 'ssl'
node.default[cert_name]['ssl_cert']['item'] = 'cert'
node.default[cert_name]['ssl_cert']['item_key'] = 'content'
node.default[cert_name]['ssl_chain']['name'] = 'chain-ca-bundle.pem'
node.default[cert_name]['ssl_chain']['source'] = 'data-bag'
node.default[cert_name]['ssl_chain']['bag'] = 'ssl'
node.default[cert_name]['ssl_chain']['item'] = 'chain'
node.default[cert_name]['ssl_chain']['item_key'] = 'content'

ssl_certificate 'chain-data-bag' do
  namespace cert_name
end
```
### Creating a PKCS12 Containing Both the Certificate and the Private Key

```ruby
ssl_certificate 'mysite' do
  common_name 'cloud.mysite.com'
  source 'self-signed'
  key_path '/etc/key/my.key'
  cert_path '/etc/cert/my.pem'
  pkcs12_path '/home/me/my.p12'
  pkcs12_passphrase 'I_Want_To_Secure_My_P12' # optional
end
```

### Creating a Certificate from a Certificate Authority

```ruby
ca_cert = '/usr/share/pki/ca-trust-source/anchors/CA.crt'
ca_key = '/usr/share/pki/ca-trust-source/anchors/CA.key'

cert = ssl_certificate 'test' do
  namespace node['test.com']
  key_source 'self-signed'
  cert_source 'with_ca'
  ca_cert_path ca_cert
  ca_key_path ca_key
end
```

### Reading the CA Certificate from a Chef Vault Bag

In this example, we read the CA certificate from a Chef Vault and use it to generate the shelf-signed certificates:

```ruby
# Create the CA from a Chef Vault bag

ca_cert = ssl_certificate 'ca.example.org' do
  common_name 'ca.example.org'
  source 'chef-vault'
  bag 'ssl'
  item 'ca_cert'
  key_item_key 'key_content'
  cert_item_key 'cert_content'
end

ssl_certificate 'example.org' do
  cert_source 'with_ca'
  ca_cert_path ca_cert.cert_path
  ca_key_path ca_cert.key_path
end
```

The vault bag content:

```json
{
  "id": "ca_cert",
  "key_content": "-----BEGIN RSA PRIVATE KEY-----\nMIIE [...]",
  "cert_content": "-----BEGIN CERTIFICATE-----\nMIIE [...]"
}
```

The knife command to create the vault bag item:

    $ knife vault create ssl ca_cert [...]

### Managing Certificates Via Attributes

Sometimes you may want to use only node attributes to manage some of your SSL Certificates (instead of [the `ssl_certificate` resource](#ssl_certificate)). You can do it using the `ssl_certificate::attr_apply` recipe and configuring them inside the `node['ssl_certificate']['items']` array:

```ruby
run_list(
  'recipe[ssl_certificate::attr_apply]'
)
override_attributes(
  'ssl_certificate' => {
    'items' => [
      {
        'name' => 'domain.com',
        'dir' => '/etc/nginx/ssl',
        'item' => 'domain_com',
        'source' => 'chef-vault',
        'bag' => 'ssl-vault',
        'key_item_key' => 'key',
        'cert_item_key' => 'cert',
        'chain_item_key' => 'chain',
        'chain_source' => 'chef-vault',
        'chain_bag' => 'ssl-vault',
        'chain_item' => 'domain_com',
        'chain_name' => 'domain.com.chain.pem'
      }
    ]
  }
)
```

## Real-world Examples

Some cookbooks that use the `ssl_certificate` resource to implement SSL/TLS:

* [`postfixadmin`](https://github.com/zuazo/postfixadmin-cookbook) cookbook: Uses the certificate for Apache httpd and nginx.
 * [`postfixadmin::apache` recipe](https://github.com/zuazo/postfixadmin-cookbook/blob/2.1.0/recipes/apache.rb#L39-L65)
 * [*apache_vhost.erb* template](https://github.com/zuazo/postfixadmin-cookbook/blob/2.1.0/templates/default/apache_vhost.erb#L52-L54)
 * [`postfixadmin::nginx` recipe](https://github.com/zuazo/postfixadmin-cookbook/blob/2.1.0/recipes/nginx.rb#L50-L71)
 * [*nginx_vhost.erb* template](https://github.com/zuazo/postfixadmin-cookbook/blob/2.1.0/templates/default/nginx_vhost.erb#L11-L13)
 * [*README.md* section](https://github.com/zuazo/postfixadmin-cookbook/blob/2.1.0/README.md#the-https-certificate)

* [`boxbilling`](https://github.com/zuazo/boxbilling-cookbook) cookbook: Uses the certificate for Apache httpd and nginx.
 * [`boxbilling::_apache` recipe](https://github.com/zuazo/boxbilling-cookbook/blob/1.0.0/recipes/_apache.rb#L86-L111)
 * [*apache_vhost.erb* template](https://github.com/zuazo/boxbilling-cookbook/blob/1.0.0/templates/default/apache_vhost.erb#L60-L62)
 * [`boxbilling::_nginx` recipe](https://github.com/zuazo/boxbilling-cookbook/blob/1.0.0/recipes/_nginx.rb#L59-L86)
 * [*nginx_vhost.erb* template](https://github.com/zuazo/boxbilling-cookbook/blob/1.0.0/templates/default/nginx_vhost.erb#L9-L11)
 * [*README.md* section](https://github.com/zuazo/boxbilling-cookbook/blob/1.0.0/README.md#the-https-certificate)

* [`kong`](https://github.com/zuazo/kong-cookbook) cookbook: Uses the certificate for the embedded nginx server.
 * [`kong::_configuration` recipe](https://github.com/zuazo/kong-cookbook/blob/0.1.0/recipes/_configuration.rb#L25-L34)
 * [*kong.yml.erb* template](https://github.com/zuazo/kong-cookbook/blob/0.1.0/templates/default/kong.yml.erb#L87-L96), which includes the nginx server configuration.
 * [*README.md* section](https://github.com/zuazo/kong-cookbook/blob/0.1.0/README.md#the-https-certificate)

* [`postfix-dovecot`](https://github.com/zuazo/postfix-dovecot-cookbook) cookbook: Creates one certificate for Postfix and another for Dovecot. Uses the [`SslCertificateCookbook::ServiceHelpers#ssl_config_for_service`](http://www.rubydoc.info/github/zuazo/ssl_certificate-cookbook/master/Chef%2FSslCertificateCookbook%2FServiceHelpers%3Assl_config_for_service) helper to set each service SSL configuration (cipher suites, supported protocols, ...).
 * [`postfix-dovecot::postfix` recipe](https://github.com/zuazo/postfix-dovecot-cookbook/blob/2.0.1/recipes/postfix.rb#L151-L170)
 * [`postfix-dovecot::dovecot` recipe](https://github.com/zuazo/postfix-dovecot-cookbook/blob/2.0.1/recipes/dovecot.rb#L178-L188)
 * [`postfix-dovecot::ssl_certificate` attributes](https://github.com/zuazo/postfix-dovecot-cookbook/blob/2.0.1/attributes/ssl_certificate.rb#L22-L31) to set the *protocols* in the correct format for each service.
 * [*README.md* section](https://github.com/zuazo/postfix-dovecot-cookbook/blob/2.0.1/README.md#the-ssl-certificate)

* [`onddo_proftpd`](https://github.com/zuazo/proftpd-cookbook) cookbook contains examples to enable TLS:
 * [*README.md* documentation with a TLS example](https://github.com/zuazo/proftpd-cookbook/tree/2.0.0#enabling-ssltls)
 * [`onddo_proftpd_test::attrs` recipe](https://github.com/zuazo/proftpd-cookbook/blob/2.0.0/test/cookbooks/onddo_proftpd_test/recipes/attrs.rb#L158-L187) used for `test-kitchen` integration tests.

Attributes
==========

| Attribute                                             | Default      | Description                        |
|:------------------------------------------------------|:-------------|:-----------------------------------|
| `node['ssl_certificate']['user']`                     | *calculated* | Default SSL files owner user.
| `node['ssl_certificate']['group']`                    | *calculated* | Default SSL files owner group.
| `node['ssl_certificate']['key_dir']`                  | *calculated* | Default SSL key directory.
| `node['ssl_certificate']['cert_dir']`                 | *calculated* | Default SSL certificate directory.

## Service Attributes

The following attributes are used to integrate SSL specific configurations with different services (Apache, nginx, ...). They are used internally by [the apache and nginx templates](#templates).

| Attribute                                             | Default      | Description                        |
|:------------------------------------------------------|:-------------|:-----------------------------------|
| `node['ssl_certificate']['service']['cipher_suite']`  | `nil`        | Service default SSL cipher suite.
| `node['ssl_certificate']['service']['protocols']`     | `nil`        | Service default SSL protocols.
| `node['ssl_certificate']['service']['apache']`        | *calculated* | Apache web service httpd specific SSL attributes.
| `node['ssl_certificate']['service']['nginx']`         | *calculated* | nginx web service specific SSL attributes.
| `node['ssl_certificate']['service']['compatibility']` | `nil`        | Service SSL compatibility level (See [below](#securing-server-side-tls)).
| `node['ssl_certificate']['service']['use_hsts']`      | `true`       | Whether to enable [HSTS](http://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) in the service.
| `node['ssl_certificate']['service']['use_stapling']`  | *calculated* | Whether to enable [OCSP stapling](http://en.wikipedia.org/wiki/OCSP_stapling) in the service (nginx only, use `node['apache']['mod_ssl']['use_stapling']` for apache).

See the [`ServiceHelpers` class documentation](http://www.rubydoc.info/github/zuazo/ssl_certificate-cookbook/master/Chef/SslCertificateCookbook/ServiceHelpers) to learn how to integrate them with new services.

Resources
=========

## ssl_certificate

Creates a SSL certificate.

By default the resource will create a self-signed certificate, but a custom one can also be used. The custom certificate can be read from several sources:

* Attribute
* Data Bag
* Encrypted Data Bag
* Chef Vault
* File

### ssl_certificate Actions

* `create`: Creates the SSL certificate.

### ssl_certificate Parameters

| Parameter               | Default                        | Description                    |
|:------------------------|:-------------------------------|:-------------------------------|
| namespace               | `{}`                           | Node namespace to read the default values from, something like `node['myapp']`. See the documentation above for more information on how to use the namespace.
| common_name             | `namespace['common_name']`     | Server name or *Common Name*, used for self-signed certificates.
| domain                  | `namespace['common_name']`     | `common_name` method alias.
| country                 | `namespace['country']`         | *Country*, used for self-signed certificates.
| city                    | `namespace['city']`            | *City*, used for self-signed certificates.
| state                   | `namespace['state']`           | *State* or *Province* name, used for self-signed certificates.
| organization            | `namespace['city']`            | *Organization* or *Company* name, used for self-signed certificates.
| department              | `namespace['city']`            | Department or *Organizational Unit*, used for self-signed certificates.
| email                   | `namespace['email']`           | *Email* address, used for self-signed certificates.
| time                    | `10 * 365 * 24 * 60 * 60`      | Attribute for setting self-signed certificate validity time in seconds or `Time` object instance.
| years                   | `10`                           | Write only attribute for setting self-signed certificate validity period in years.
| owner                   | *calculated*                   | Certificate files owner user.
| group                   | *calculated*                   | Certificate files owner group.
| dir                     | `nil`                          | Write only attribute for setting certificate path and key path (both) to a directory (`key_dir` and `cert_dir`).
| source                  | `nil`                          | Write only attribute for setting certificate source and key source (both) to a value (`key_source` and `cert_source`). Can be `'self-signed'`, `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| bag                     | `nil`                          | Write only attribute for setting certificate bag and key bag (both) to a value (`key_bag` and `cert_bag`).
| item                    | `nil`                          | Write only attribute for setting certificate item name and key bag item name (both) to a value (`key_item` and `cert_item`).
| encrypted               | `nil`                          | Write only attribute for setting certificate encryption and key encryption (both) to a value (`key_encrypted` and `cert_encrypted`).
| secret_file             | `nil`                          | Write only attribute for setting certificate chef secret file and key chef secret file (both) to a value (`key_secret_file` and `cert_secret_file`).
| key_path                | *calculated*                   | Private key full path.
| key_name                | `"#{name}.key"`                | Private key file name.
| key_dir                 | *calculated*                   | Private key directory path.
| key_source              | `'self-signed'`                | Source type to get the SSL key from. Can be `'self-signed'`, `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| key_bag                 | `namespace['ssl_key']['bag']`  | Name of the Data Bag where the SSL key is stored.
| key_item                | `namespace['ssl_key']['item']` | Name of the Data Bag Item where the SSL key is stored.
| key_item_key            | *calculated*                   | Key of the Data Bag Item where the SSL key is stored.
| key_encrypted           | `false`                        | Whether the Data Bag where the SSL key is stored is encrypted.
| key_secret_file         | `nil`                          | Secret file used to decrypt the Data Bag where the SSL key is stored.
| key_content             | *calculated*                   | SSL key file content in clear. **Be careful when using it.******
| cert_path               | *calculated*                   | Public certificate full path.
| cert_name               | `"#{name}.pem"`                | Public certiticate file name.
| cert_dir                | *calculated*                   | Public certificate directory path.
| cert_source             | `'self-signed'`                | Source type to get the SSL cert from. Can be `'self-signed'`, `'with_ca'`, `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| cert_bag                | `namespace['ssl_cert']['bag']` | Name of the Data Bag where the SSL cert is stored.
| cert_item               | *calculated*                   | Name of the Data Bag Item where the SSL cert is stored.
| cert_item_key           | *calculated*                   | Key of the Data Bag Item where the SSL cert is stored.
| cert_encrypted          | `false`                        | Whether the Data Bag where the SSL cert is stored is encrypted.
| cert_secret_file        | `nil`                          | Secret file used to decrypt the Data Bag where the SSL cert is stored.
| cert_content            | *calculated*                   | SSL cert file content in clear.
| subject_alternate_names | `nil`                          | Subject Alternate Names for the cert.
| chain_path              | *calculated*                   | Intermediate certificate chain full path.
| chain_name              | `nil`                          | File name of intermediate certificate chain file.
| chain_dir               | *calculated*                   | Intermediate certificate chain directory path.
| chain_source            | `nil`                          | Source type to get the intermediate certificate chain from. Can be `'attribute'`, `'data-bag'`, `'chef-vault'` or `'file'`.
| chain_bag               | *calculated*                   | Name of the Data Bag where the intermediate certificate chain is stored.
| chain_item              | *calculated*                   | Name of the Data Bag Item where the intermediate certificate chain is stored.
| chain_item_key          | *calculated*                   | Key of the Data Bag Item where the intermediate certificate chain is stored.
| chain_encrypted         | `false`                        | Whether the Data Bag where the intermediate certificate chain is stored is encrypted.
| chain_secret_file       | `nil`                          | Secret file used to decrypt the Data Bag where the intermediate certificate chain is stored.
| chain_content           | *calculated*                   | Intermediate certificate chain file content in clear.
| chain_combined_name     | *calculated*                   | File name of intermediate certificate chain combined file (for **nginx**).
| chain_combined_path     | *calculated*                   | Intermediate certificate chain combined file full path (for **nginx**).
| ca_cert_path            | *nil*                          | Certificate Authority full path.
| ca_key_path             | *nil*                          | Key Authority full path.
| pkcs12_path             | *nil*                          | Optional PKCS12 full path.
| pkcs12_passphrase       | *nil*                          | Optional PKCS12 passphrase.

Templates
=========

This cookbook includes a simple VirtualHost template which can be used by the `web_app` definition from the [apache2](https://supermarket.chef.io/cookbooks/apache2) cookbook:

```ruby
cert = ssl_certificate 'my-webapp' do
  namespace node['my-webapp']
  notifies :restart, 'service[apache2]'
end

include_recipe 'apache2'
include_recipe 'apache2::mod_ssl'
web_app 'my-webapp' do
  cookbook 'ssl_certificate'
  server_name cert.common_name
  docroot # [...]
  # [...]
  ssl_key cert.key_path
  ssl_cert cert.cert_path
  ssl_chain cert.chain_path
end
```

## Partial Templates

This cookbook contains [partial templates](http://docs.chef.io/templates.html#partial-templates) that you can include in your virtualhost templates to enable and configure the SSL protocol. These partial templates are available:

* *apache.erb*: For Apache httpd web server.
* *nginx.erb*: For nginx web server.

### Partial Templates Parameters

| Parameter          | Default          | Description                        |
|:-------------------|:-----------------|:-----------------------------------|
| ssl_cert           | `nil`            | Public SSL certificate full path.
| ssl_key            | `nil`            | Private SSL key full path.
| ssl_chain          | `nil`            | Intermediate SSL certificate chain full path (**apache** only) *(optional)*.
| ssl_compatibility  | *node attribute* | SSL compatibility level (See [below](#securing-server-side-tls)).

### Apache Partial Template

#### Using `web_app` Definition

If you are using the `web_app` definition, you should pass the `@params` variables to the partial template:

```ruby
web_app 'my-webapp-ssl' do
  docroot node['apache']['docroot_dir']
  server_name cert.common_name
  # [...]
  ssl_key cert.key_path
  ssl_cert cert.cert_path
  ssl_chain cert.chain_path
end
```

```erb
<%# included by web_app definition %>
<VirtualHost *:443>
  ServerName <%= @params[:server_name] %>
  DocumentRoot <%= @params[:docroot] %>
  <%# [...] %>

  <%= render 'apache.erb', cookbook: 'ssl_certificate', variables: @params.merge(node: node) %>
</VirtualHost>
```

#### Using `template` Resource

```ruby
cert = ssl_certificate 'my-webapp-ssl'
template ::File.join(node['apache']['dir'], 'sites-available', 'my-webapp-ssl') do
  source 'apache_vhost.erb'
  # [...]
  variables(
    # [...]
    ssl_key: cert.key_path,
    ssl_cert: cert.chain_combined_path,
    ssl_chain: cert.chain_path
  )
end
```

You can include the partial template as follows:

```erb
<%# included by template resource %>
<VirtualHost *:443>
  ServerName <%= @server_name %>
  DocumentRoot <%= @docroot %>
  <%# [...] %>

  <%= render 'apache.erb', cookbook: 'ssl_certificate' %>
</VirtualHost>
```

### Nginx Partial Template

If you are using nginx template, we recommended to use the `SslCertificate#chain_combined_path` path value to set the `ssl_cert` variable instead of `SslCertificate#cert_path`. That's to ensure we [always include the chained certificate](http://nginx.org/en/docs/http/configuring_https_servers.html#chains) if there is one. This will also work when there is no chained certificate.

```ruby
cert = ssl_certificate 'my-webapp-ssl'
template ::File.join(node['nginx']['dir'], 'sites-available', 'my-webapp-ssl') do
  source 'nginx_vhost.erb'
  # [...]
  variables(
    # [...]
    ssl_key: cert.key_path,
    ssl_cert: cert.chain_combined_path
  )
end
```

See [the examples above](#examples).

## Securing Server Side TLS

You can change the SSL compatibility level based on [the TLS recommendations in the Mozilla wiki](https://wiki.mozilla.org/Security/Server_Side_TLS#Recommended_configurations) using the `ssl_compatibility` template parameter:

```ruby
cert = ssl_certificate 'my-webapp' do
  namespace node['my-webapp']
  notifies :restart, 'service[apache2]'
end

include_recipe 'apache2'
include_recipe 'apache2::mod_ssl'
web_app 'my-webapp' do
  cookbook 'ssl_certificate'
  server_name cert.common_name
  docroot # [...]
  # [...]
  ssl_key cert.key_path
  ssl_cert cert.cert_path
  ssl_chain cert.chain_path
  ssl_compatibility :modern # :modern | :intermediate | :old
end
```

You can also use the `node['ssl_certificate']['service']['compatibility']` node attribute to change the compatibility level used by default.

Testing
=======

See [TESTING.md](https://github.com/zuazo/ssl_certificate-cookbook/blob/master/TESTING.md).

## ChefSpec Matchers

### ssl_certificate(name)

Helper method for locating a `ssl_certificate` resource in the collection.

```ruby
resource = chef_run.ssl_certificate('postfixadmin')
expect(resource).to notify('service[apache2]').to(:restart)
```

### create_ssl_certificate(name)

Assert that the Chef run creates ssl_certificate.

```ruby
expect(chef_run).to create_ssl_certificate('cloud.mysite.com')
```

Contributing
============

Please do not hesitate to [open an issue](https://github.com/zuazo/ssl_certificate-cookbook/issues/new) with any questions or problems.

See [CONTRIBUTING.md](https://github.com/zuazo/ssl_certificate-cookbook/blob/master/CONTRIBUTING.md).

TODO
====

See [TODO.md](https://github.com/zuazo/ssl_certificate-cookbook/blob/master/TODO.md).


License and Author
==================

|                      |                                          |
|:---------------------|:-----------------------------------------|
| **Author:**          | [Raul Rodriguez](https://github.com/raulr) (<raul@raulr.com>)
| **Author:**          | [Xabier de Zuazo](https://github.com/zuazo) (<xabier@zuazo.org>)
| **Contributor:**     | [Steve Meinel](https://github.com/smeinel)
| **Contributor:**     | [Djuri Baars](https://github.com/dsbaars)
| **Contributor:**     | [Elliott Davis](https://github.com/elliott-davis)
| **Contributor:**     | [Jeremy MAURO](https://github.com/jmauro)
| **Contributor:**     | [Benjamin Nørgaard](https://github.com/blacksails)
| **Contributor:**     | [Stanislav Bogatyrev](https://github.com/realloc)
| **Contributor:**     | [Karl Svec](https://github.com/karlsvec)
| **Contributor:**     | [Nikita Borzykh](https://github.com/sample)
| **Contributor:**     | [Baptiste Courtois](https://github.com/Annih)
| **Contributor:**     | [Taliesin Sisson](https://github.com/taliesins)
| **Copyright:**       | Copyright (c) 2015, Xabier de Zuazo
| **Copyright:**       | Copyright (c) 2014-2015, Onddo Labs, SL.
| **License:**         | Apache License, Version 2.0

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
