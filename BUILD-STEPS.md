# Build Steps

1. `gem install bundler -v 2.3.22 && rbenv rehash`

1. `bundle install`
    - This step often fails to due environment-specific issues. Look in the [Bundle Install Tips](#bundle-install-tips) section below for steps to resolve many common issues.

1. `bundle exec rake install:hooks`

1. `bundle exec rake install`

1. `bundle exec rake build`

1. Run the website `bin/dashboard-server`

1. **Open <http://localhost:3000/>** to verify its running.

After setup, [configure your editor](#editor-configuration), read about our [code styleguide](./STYLEGUIDE.md), our [test suites](./TESTING.md), or find more docs on [the wiki](https://github.com/code-dot-org/code-dot-org/wiki/For-Developers).

# Recommended hardware

While it's possible to run the server locally without these, we've found the following hardware specifications to be best for fast development.

- Memory: minimum of 8GB RAM for `dashboard-server` and `yarn`
- Storage: The repository takes up 20GB

[ubuntu-iso-url]: https://releases.ubuntu.com/focal/ubuntu-20.04.6-desktop-amd64.iso
