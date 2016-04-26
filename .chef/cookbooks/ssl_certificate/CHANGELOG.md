ssl_certificate CHANGELOG
=========================

This file is used to list changes made in each version of the `ssl_certificate` cookbook.

## v1.11.0 (2015-12-10)

* Fix some RuboCop offenses.
* Only add internal file resources to the collection when running tests ([issue #23](https://github.com/zuazo/ssl_certificate-cookbook/pull/23), thanks [Karl Svec](https://github.com/karlsvec)).
* Fix sending notifications from the `ssl_certificate` resource ([issue #21](https://github.com/zuazo/ssl_certificate-cookbook/pull/21), thanks [Karl Svec](https://github.com/karlsvec)).
* .gitignore: remove metadata.json.

## v1.10.0 (2015-11-23)

* Fix some certificate errors on Windows due to CRLF conversion ([issue #19](https://github.com/zuazo/ssl_certificate-cookbook/pull/19), thanks [Taliesin Sisson](https://github.com/taliesins)).
* Fix *undefined method pkcs12_path for Chef::Resource::File* error.

* Documentation:
 * README: Some typos and improvements.

* Testing:
 * Gemfile updates:
  * foodcritic `~> `5.0.0`
  * RuboCop `~> `0.35.0`.
  * Berkshelf `~> 4.0`.
  * guard-foodcritic `~> 2.0`.
 * Rakefile:
  * Fix integration task to allow arguments.
  * Check CI.

## v1.9.0 (2015-09-06)

* Add support for [PKCS12](https://en.wikipedia.org/wiki/PKCS_12) ([issue #17](https://github.com/zuazo/ssl_certificate-cookbook/pull/17), thanks [Baptiste Courtois](https://github.com/Annih)).
* metadata: Add `source_url` and `issues_url` links.

* Documentation:
 * README: Add *Real-world Examples* section.

* Testing:
 * Run kitchen tests on CircleCI.
 * Travis CI: Use bundle cache.
 * Gemfile: Update RuboCop to `0.34.0`.
 * Rakfile: Use `Kitchen` ruby class instead of `sh`.

## v1.8.1 (2015-09-03)

* README: Fix title.

## v1.8.0 (2015-09-03)

* Fix Chef Supermarket cookbook links.
* Add Windows support ([issue #15](https://github.com/zuazo/ssl_certificate-cookbook/pull/15), thanks [Baptiste Courtois](https://github.com/Annih)).
* Add Oracle Linux and Scientific Linux support.
* Improve platforms support using `node['platform_family']` attribute.

* Documentation:
 * README:
  * Add ca path documentation to the namespace attributes.
  * Improve description.
 * TESTING: Add Docker and EC2 documentation.

* Testing:
 * Use `SoloRunner` to run unit tests faster.
 * Move ChefSpec tests to *test/unit*.
 * Add *.kitchen.docker.yml* file.
 * Travis CI: Run against Ruby `2.2`.
 * Gemfile: kichen-docker ~> `2.1`.
 * Rakfile: Add clean task.

## v1.7.0 (2015-08-12)

* Fix README tables.
* Update contact information and links after migration.
* Gemfile: Update RuboCop to `0.33.0`.
* Update chef links to use *chef.io*.

## v1.6.0 (2015-08-02)

* Load encrypted secret before passing to the `EncryptedDataBagItem.load` ([issue #14](https://github.com/zuazo/ssl_certificate-cookbook/pull/14), thanks [Nikita Borzykh](https://github.com/sample)).
* Update RuboCop to `0.32.1`.
* README:
 * Use markdown tables.
 * Add GitHub badge.

## v1.5.0 (2015-04-25)

* Add sensitive true to the created files ([issue #12](https://github.com/zuazo/ssl_certificate-cookbook/issues/12), thanks [Jonathan Chauncey](https://github.com/jchauncey) for reporting).
* Add support for different types in Subject Alternative Names ([issue #13](https://github.com/zuazo/ssl_certificate-cookbook/issues/13), thanks [Jonathan Chauncey](https://github.com/jchauncey) for reporting).
* README: Fix all RuboCop offenses in examples.
* Update Gemfile and kitchen.yml files.
  * Gemfile: Update RuboCop to `0.30.1`.

## v1.4.0 (2015-04-05)

* Add `attr_apply` recipe: Create a certificate list from attributes ([issue #10](https://github.com/zuazo/ssl_certificate-cookbook/pull/10), thanks [Stanislav Bogatyrev](https://github.com/realloc)).
* Fix invalid metadata ([issue #11](https://github.com/zuazo/ssl_certificate-cookbook/pull/11), thanks [Karl Svec](https://github.com/karlsvec)).
* Update RuboCop to `0.29.1` (fix some new offenses).

## v1.3.0 (2015-02-03)

* Add `namespace['source']` common attribute.
* Fix chef vault source: `chef_gem` method not found error.
* Fix `#data_bag_read_fail` method name.
* README: Fix *item_key* attribute name.

## v1.2.2 (2015-01-16)

* Fix unit tests: Run the tests agains Chef 11 and Chef 12.

## v1.2.1 (2015-01-16)

* Fix *key content* when using `'file'` source.

## v1.2.0 (2015-01-07)

* Fix file source path in attributes.
* Fix *"stack level too deep"* error with CA certificates.
* Nginx template: Add `ssl on;` directive.
* Remove setting CA in apache template (bad idea).
* Rename template helpers to service helpers.
 * Document *ServiceHelpers* methods.
* README: Some small fixes.

## v1.1.0 (2015-01-02)

* Fix FreeBSD support.
* Allow to change the certificate file owner.
* Web server template improvements:
 * Fix Apache 2.4 support.
 * Add partial templates for Apache and nginx.
 * Add CA certificate file support.
 * Add adjustable SSL compatibility level.
 * Add OCSP stapling support.
 * Enable HSTS and stapling by default.
* Fix all integration tests.

## v1.0.0 (2014-12-30)

* Bugfix: Cannot read SSL intermediary chain from data bag.
* Fix Directory Permissions for Apache `2.4` ([issue #7](https://github.com/zuazo/ssl_certificate-cookbook/pull/7), thanks [Elliott Davis](https://github.com/elliott-davis)).
* Add CA support for self signed certificates ([issue #8](https://github.com/zuazo/ssl_certificate-cookbook/pull/8), thanks [Jeremy MAURO](https://github.com/jmauro)).
* Apache template:
  * Disable `SSLv3` by default (**breaking change**).
  * Add chained certificate support.
  * Allow to change the cipher suite and protocol in the apache template.
* Big code clean up:
  * Split resource code in multiple files.
  * Remove duplicated code.
  * Integrate with foodcritic.
  * Integrate with RuboCop.
  * Integrate with `should_not` gem.
  * Integrate with travis-ci, codeclimate and gemnasium.
  * Homogenize license headers.
* Add ChefSpec unit tests.
* Add integration tests: bats and Serverspec.
* Update Gemfile and Berksfile files.
* Add Guardfile.
* README:
  * Multiple fixes and improvements ([issue #9](https://github.com/zuazo/ssl_certificate-cookbook/pull/9), thanks [Benjamin Nørgaard](https://github.com/blacksails)).
  * Split in multiple files.
  * Add TOC.
  * Add badges.
* Add LICENSE file.

## v0.4.0 (2014-11-19)

* Add Apache 2.4 support ([issue #4](https://github.com/zuazo/ssl_certificate-cookbook/pull/4), thanks [Djuri Baars](https://github.com/dsbaars)).
* Add supported platform list.
* kitchen.yml completed and updated.

## v0.3.0 (2014-11-03)

Special thanks to [Steve Meinel](https://github.com/smeinel) for his great contributions.

* Add Subject Alternate Names support for certs ([issue #2](https://github.com/zuazo/ssl_certificate-cookbook/pull/2), thanks [Steve Meinel](https://github.com/smeinel)).
* Add support for deploying an intermediate cert chain file ([issue #3](https://github.com/zuazo/ssl_certificate-cookbook/pull/3), thanks [Steve Meinel](https://github.com/smeinel)).
* ChefSpec matchers: add helper methods to locate LWRP resources.
* README: Chef `11.14.2` required.
* TODO: complete it with more tasks and use checkboxes.

## v0.2.1 (2014-09-14)

* `ssl_certificate` resource notifications fixed (issue [#1](https://github.com/zuazo/ssl_certificate-cookbook/pull/1), thanks [Matt Graham](https://github.com/gadgetmg) for reporting)

## v0.2.0 (2014-08-13)

* Added ChefSpec ssl_certificate matcher
* Fixed: undefined method "key_path" for nil:NilClass
* README: fixed ruby syntax highlighting in one example

## v0.1.0 (2014-04-15)

* Initial release of `ssl_certificate`
