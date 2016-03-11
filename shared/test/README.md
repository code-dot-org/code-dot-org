# Shared Tests

Most shared tests include a common `test_helper.rb` before running tests:

```ruby
require_relative 'test_helper'
class MyNewTest < Minitest::Test
  include SetupTest

  def test_something
    # [...]
  end
end
```

This test helper includes:

- common test libraries (`minitest`, etc)
- `webmock` to disable external HTTP requests (use stubs when needed)

The included `SetupTest` module automatically wraps each test case with the following:
- VCR to record/replay external HTTP request fixtures
- truncating database tables to ensure repeatable tests
- enclosing each test in a `rollback: always` transaction, to leave behind no database side-effects

## Using VCR

VCR is enabled automatically when `include SetupTest` is added to the test class extending `Minitest::Test`.

When you run a test that generates external HTTP requests, it will generate `.yml` fixture files within `shared/test/fixtures/vcr/[test_class]/[test_name].yml`. Make sure to `git-add` the .yml to commit it along with your new test.

When you modify a test in a way that changes the HTTP requests it generates, you will need to re-generate the fixtures. To do this, simply delete the relevant `.yml` files and run the rest again.

If tests depend on authorization or API keys (such as an AWS access/secret key) in order for them to succeed, simply make sure this information is available in the environment when running the test and generating the fixture. Also make sure that no sensitive information ends up in the generated fixtures before committing them. (See `test_helper.rb` for examples of how to filter unnecessary or sensitive headers.)

See e.g. `shared/test/test_edit_csp.rb` and the corresponding `shared/test/fixtures/vcr/editcsp/edit_csp.yml` files for a simple reference.

For more information, refer to VCR's excellent [documentation](https://relishapp.com/vcr/vcr/docs) that explains its API usage in great detail.
