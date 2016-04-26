# [nodejs-cookbook](https://github.com/redguide/nodejs)
[![CK Version](http://img.shields.io/cookbook/v/nodejs.svg)](https://supermarket.getchef.com/cookbooks/nodejs) [![Build Status](https://img.shields.io/travis/redguide/nodejs.svg)](https://travis-ci.org/redguide/nodejs)
[![Gitter chat](https://badges.gitter.im/redguide/nodejs.png)](https://gitter.im/redguide/nodejs)

## DESCRIPTION

Installs node.js/io.js and manage npm

## USAGE

Include the nodejs recipe to install node on your system based on the default installation method:
```chef
include_recipe "nodejs"
```

### Engine

You can select different engine by setting `node['nodejs']['engine']`
```
node['nodejs']['engine'] => 'node' # default
node['nodejs']['engine'] => 'iojs'
```

You can also use recipes `nodejs::nodejs` or `nodejs::iojs`.

### Install methods

#### Package

Install node from packages:

```chef
node['nodejs']['install_method'] = 'package' # Not necessary because it's the default
include_recipe "nodejs"
# Or
include_recipe "nodejs::nodejs_from_package"
```
Note that only apt (Ubuntu, Debian) appears to have up to date packages available. 
Centos, RHEL, etc are non-functional (try `nodejs_from_binary` for those).

#### Binary

Install node from official prebuilt binaries:
```chef
node['nodejs']['install_method'] = 'binary'
include_recipe "nodejs"
# Or
include_recipe "nodejs::nodejs_from_binary"
```

#### Source

Install node from sources:
```chef
node['nodejs']['install_method'] = 'source'
include_recipe "nodejs"
# Or
include_recipe "nodejs::nodejs_from_source"
```

## NPM

Npm is included in nodejs installs by default.
By default, we are using it and call it `embedded`.
Adding recipe `nodejs::npm` assure you to have npm installed and let you choose install method with `node['nodejs']['npm']['install_method']`
```chef
include_recipe "nodejs::npm"
```
_Warning:_ This recipe will include the `nodejs` recipe, which by default includes `nodejs::nodejs_from_package` if you did not set `node['nodejs']['install_method']`.

## LWRP

### nodejs_npm

`nodejs_npm` let you install npm packages from various sources:
* npm registry:
 * name: `attribute :package`
 * version: `attribute :version` (optionnal)
* url: `attribute :url`
 * for git use `git://{your_repo}`
* from a json (packages.json by default): `attribute :json`
 * use `true` for default
 * use a `String` to specify json file
 
Packages can be installed globally (by default) or in a directory (by using `attribute :path`)

You can specify an `NPM_TOKEN` environment variable for accessing [NPM private modules](https://docs.npmjs.com/private-modules/intro) by using `attribute :npm_token`

You can append more specific options to npm command with `attribute :options` array :  
 * use an array of options (w/ dash), they will be added to npm call.
 * ex: `['--production','--force']` or `['--force-latest']`
 
This LWRP attempts to use vanilla npm as much as possible (no custom wrapper).

### Packages

```ruby
nodejs_npm "express"

nodejs_npm "async" do
  version "0.6.2"
end

nodejs_npm "request" do
  url "github mikeal/request"
end

nodejs_npm "grunt" do
  path "/home/random/grunt"
  json true
  user "random"
end

nodejs_npm "my_private_module" do
  path "/home/random/myproject" # The root path to your project, containing a package.json file
  json true
  npm_token "12345-abcde-e5d4c3b2a1"
  user "random"
  options ['--production'] # Only install dependencies. Skip devDependencies
end
```
[Working Examples](test/cookbooks/nodejs_test/recipes/npm.rb)

Or add packages via attributes (which accept the same attributes as the LWRP above):

```json
"nodejs": {
  "npm_packages": [
    {
      "name": "express"
    },
    {
      "name": "async",
      "version": "0.6.2"
    },
    {
      "name": "request",
      "url": "github mikeal/request"
    }
    {
      "name": "grunt",
      "path": "/home/random/grunt",
      "json": true,
      "user": "random"
    }
  ]
}
```

## AUTHORS

* Marius Ducea (marius@promethost.com)
* Nathan L Smith (nlloyds@gmail.com)
* Guilhem Lettron (guilhem@lettron.fr)
* Barthelemy Vessemont (bvessemont@gmail.com)
