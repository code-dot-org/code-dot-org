# CDO Application Config

The file [`config.yml.erb`](../config.yml.erb) and the files in this directory define configuration settings for the code-dot-org (CDO) server application.

Keys in this configuration correspond to `CDO.*` properties, e.g., `x: foo` will set `CDO.x` to value `'foo'`.

All `CDO.*` properties _must_ be defined in the default `config.yml.erb` file, and _should_ be documented with descriptive comments.

Once CDO configuration is loaded on startup it is 'frozen', so values cannot be modified at runtime.
However, for testing, you can stub specific keys using Mocha syntax, e.g.:

```ruby
CDO.stubs(x: 'foo')
```

Properties defined below can be further configured through several overrides.
The loading order is as follows (1 = highest priority):

1. `ENV`
    - environment-variable overrides (`CDO_*`, plus `RACK_ENV` and `RAILS_ENV`) \
      e.g.: `CDO_MY_VARIABLE` would override `CDO.my_variable`.
2. `locals.yml`
    - local configuration: locally-configured overrides
3. `globals.yml`:
    - global configuration: globally-configured (e.g., Chef provisioned) overrides
4. `config/[env].yml.erb`
    - environment-specific overrides (version-controlled)
5. `config.yml.erb`
    - base configuration (version-controlled)

CDO properties are generally used for the following use-cases:

- Configuration defaults that vary per-environment;
- Configuration that may need to be manually overridden, e.g., when developing/testing services locally;
- Application secrets, such as API keys or passwords;
- Dynamic application endpoints, such as third-party services or dynamically-provisioned application resources

CDO properties are not really needed for the following use-cases (though they have sometimes been used in these ways):

- Fixed constants that never change
   - Use a standard Ruby module/class constant.
- Global namespace for general-purpose utility objects/functions, e.g., `CDO.cache`
   - Use a different namespace/constant to contain the object, e.g., `Cdo.cache` or `CDO_CACHE`.
- Other custom logic that combines values from other CDO properties
   - Define a class method in another module/class containing the logic.

See also:
- `DCDO` and `Gatekeeper` properties are similar to CDO,
but are managed through an admin interface and can be updated while the application is running.
- [secrets.md](secrets.md) - documents the `!Secret` tag used for configuring application secrets.