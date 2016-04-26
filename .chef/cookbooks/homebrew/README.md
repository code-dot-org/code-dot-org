# Homebrew Cookbook
[![Build Status](https://travis-ci.org/chef-cookbooks/homebrew.svg?branch=master)](http://travis-ci.org/chef-cookbooks/homebrew) [![Cookbook Version](https://img.shields.io/cookbook/v/homebrew.svg)](https://supermarket.chef.io/cookbooks/homebrew)

This cookbook installs [Homebrew](http://mxcl.github.com/homebrew/) and under Chef 11 and earlier versions, its package provider replaces MacPorts as the _default package provider_ for the package resource on OS X systems.

# Requirements
Chef 12: The package provider is not necessary on Chef 12, as the default [OS X package provider](https://github.com/chef/chef-rfc/blob/master/rfc016-homebrew-osx-package-provider.md) is homebrew.

Chef <= 11: The package provider will be set as the default provider for OS X.

## Prerequisites
In order for this recipe to work, your userid must own `/usr/local`. This is outside the scope of the cookbook because it's possible that you'll run the cookbook as your own user, not root and you'd have to be root to take ownership of the directory. Easiest way to get started:

```bash
sudo chown -R `whoami`:staff /usr/local
```

Bear in mind that this will take ownership of the entire folder and its contents, so if you've already got stuff in there (eg MySQL owned by a `mysql` user) you'll need to be a touch more careful. This is a recommendation from the Homebrew project.

**Note** This cookbook _only_ supports installing in `/usr/local`. While the Homebrew project itself allows for alternative installations, this cookbook doesn't.

## Platform
- Mac OS X (10.6+)

The only platform supported by Homebrew itself at the time of this writing is Mac OS X. It should work fine on Server edition as well, and on platforms that Homebrew supports in the future.

## Cookbooks
- build-essential: homebrew itself doesn't work well if XCode is not installed.

# Attributes
- `node['homebrew']['owner']` - The user that will own the Homebrew installation and packages. Setting this will override the default behavior which is to use the non-privileged user that has invoked the Chef run (or the `SUDO_USER` if invoked with sudo). The default is `nil`.
- `node['homebrew']['auto-update']` - Whether the default recipe should automatically update homebrew each run or not. The default is `true` to maintain compatibility. Set to false or nil to disable. Note that disabling this feature may cause formula to not work.
- `node['homebrew']['formulas']` - An Array of formula that should be installed using homebrew by default, used only in the `homebrew::install_formulas` recipe.
  - To install the most recent version, include just the recipe name: `- simple_formula`
  - To install a specific version, specify both its name and version:

    ```
    - name: special-version-formula
      version: 1.2.3
    ```

  - To install the HEAD of a formula, specify both its name and `head: true`:

    ```
    - name: head-tracking-formula
      head: true
    ```

- `node['homebrew']['casks']` - An Array of casks that should be installed using brew cask by default, used only in the `homebrew::install_casks` recipe.
- `node['homebrew']['taps']` - An Array of taps that should be installed using brew tap by default, used only in the `homebrew::install_taps` recipe.

# Resources and Providers
This cookbook includes a package resource provider to use homebrew. Under Chef 12+, this is not necessary, and the code doesn't actually get used on Chef 12+. This was preserved to maintain backwards compatiblity with older versions of Chef.

## package / homebrew\_package
This cookbook provides a package provider called `homebrew_package` which will install/remove packages using Homebrew. This becomes the default provider for `package` if your platform is Mac OS X.

As this extends the built-in package resource/provider in Chef, it has all the resource attributes and actions available to the package resource. However, a couple notes:
- Homebrew itself doesn't have a notion of "upgrade" per se. The "upgrade" action will simply perform an install, and if the Homebrew Formula for the package is newer, it will upgrade.
- Likewise, Homebrew doesn't have a purge, but the "purge" action will act like "remove".

### Examples

```ruby
package 'mysql' do
  action :install
end

homebrew_package 'mysql'

package 'mysql' do
  provider Chef::Provider::Package::Homebrew
end

package 'wireshark' do
  options '--with-qt --devel'
end
```

### homebrew\_tap
LWRP for `brew tap`, a Homebrew command used to add additional formula repositories. From the `brew` man page:

```text
tap [tap]
       Tap a new formula repository from GitHub, or list existing taps.

       tap is of the form user/repo, e.g. brew tap homebrew/dupes.
```

Default action is `:tap` which enables the repository. Use `:untap` to disable a tapped repository.

#### Examples

```ruby
homebrew_tap 'homebrew/dupes'

homebrew_tap 'homebrew/dupes' do
  action :untap
end
```

## homebrew\_cask
LWRP for `brew cask`, a Homebrew-style CLI workflow for the administration of Mac applications distributed as binaries. It's implemented as a homebrew "external command" called cask.

[homebrew-cask on GitHub](https://github.com/caskroom/homebrew-cask)

### Prerequisites
You must have the homebrew-cask repository tapped.

```ruby
homebrew_tap 'caskroom/cask'
```

And then install the homebrew cask package before using this LWRP.

```ruby
package "brew-cask" do
  action :install
  end
```

You can include the `homebrew::cask` recipe to do this.

### Examples

```ruby
homebrew_cask "google-chrome"

homebrew_cask "google-chrome" do
  action :uncask
end
```

Default action is `:cask` which installs the Application binary . Use `:uncask` to uninstall a an Application.

[View the list of available Casks](https://github.com/caskroom/homebrew-cask/tree/master/Casks)

# Usage
We strongly recommend that you put "recipe[homebrew]" in your node's run list, to ensure that it is available on the system and that Homebrew itself gets installed. Putting an explicit dependency in the metadata will cause the cookbook to be downloaded and the library loaded, thus resulting in changing the package provider on Mac OS X, so if you have systems you want to use the default (Mac Ports), they would be changed to Homebrew.

The default recipe also ensures that Homebrew is installed and up to date if the auto update attribute (above) is true (default).

# License and Authors
This cookbook is maintained by CHEF. The original author, maintainer and copyright holder is Graeme Mathieson. The cookbook remains licensed under the Apache License version 2.

[Original blog post by Graeme](https://woss.name/articles/converging-your-home-directory-with-chef/)

Author:: Graeme Mathieson ([mathie@woss.name](mailto:mathie@woss.name))

Author:: Joshua Timberman ([joshua@chef.io](mailto:joshua@chef.io))

```text
Copyright:: 2011, Graeme Mathieson
Copyright:: 2012-2015, Chef Software, Inc. <legal@chef.io>

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
