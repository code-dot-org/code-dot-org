v1.0.6
======
* Get rid of warnings about defined constant
* update Chef download url
* Updates supported versions
* require chef/rest
* use Chef::Mash explicitly
* Define the Chef::Mash constant if not provided by chef
* add test suites for ubuntu 14.04 and centos 7

v1.0.4
======
* file_cache_path path to store chef-client
* Avoid deleting chef-server packages if using the same cache dir
* Only backup the last old chef client file
* make sure directory exists before trying to write to it

v1.0.2
======
* Maintenance updates
* Support for Fedora
* omnitrucker solaris update
* bug fixes

v1.0.0
======
* Breaking change: `:always_download` is now defaulted to false
* Add solaris package install support (#37 thanks @jtimberman)
* Update notifies/subscribes usage to support older Chefs (#38 thanks @spheromak)

v0.2.8
======
* Always download the package (thanks @miketheman for swiftly pointing out the issue!)

v0.2.6
======
* Work with amazon linux (thanks @thommay)
* Disable updates on debian 5 (thanks @ianand0204)
* Only use major version on debian systems (thanks @kvs)
* Allow prevention of downgrades (thanks @buysse)
* Add support for restarting chef service after upgrade (thanks @andrewfraley)

v0.2.4
======
* Only download omnibus package if version difference detected (#20 #22 #23)
* Provide attribute for always downloading package even if version matches

v0.2.3
======
* Use chef internals for interactions with omnitruck to provide proper proxy support (#19)

v0.2.0
======
* Use omnitruck client for url generation for package fetching
* Use `prerelease` in favor of `allow_release_clients`

v0.1.2
======
* Fix regression on debian package path construction (thanks [ashmere](https://github.com/ashmere))

v0.1.1
======
* Search for proper version suffix if not provided (removes default '-1')
* Do not allow release clients by default when version search is enabled
* Push omnibus package installation to the end of run (reduces issue described in #10)
* Allow updater to be disabled via attribute (thanks [Teemu Matilainen](https://github.com/tmatilai))

v0.1.0
======
* Fix redhat related versioning issues
* Remove requirement for '-1' suffix on versions
* Initial support for automatic latest version install

v0.0.5
======
* Add support for Ubuntu 12.10
* Path fixes for non-64 bit packages (thanks [ashmere](https://github.com/ashmere))

v0.0.4
======
* Use new aws bucket by default
* Update file key building

v0.0.3
======
* Path fix for debian omnibus packages (thanks [ashmere](https://github.com/ashmere))

v0.0.2
======
* Add robust check when uninstalling chef gem to prevent removal from omnibus

v0.0.1
======
* Initial release
