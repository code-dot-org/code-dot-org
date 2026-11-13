require 'test_helper'

# application.js is a frozen legacy bundle: no minifier runs in the asset
# pipeline, so it ships pre-minified sources plus small unminified glue.
# Changes are limited to security updates; new frontend code belongs in
# apps/ or frontend/.
class ApplicationJsBundleTest < ActiveSupport::TestCase
  # ~494KB today; headroom is for patch-level gem drift, not new dependencies.
  MAX_COMPILED_BYTES = 510_000

  def test_bundle_does_not_grow
    env = Sprockets::Railtie.build_environment(Rails.application)
    size = env.find_asset('application.js').source.bytesize
    assert_operator size, :<=, MAX_COMPILED_BYTES,
      "application.js compiled to #{size} bytes, over the #{MAX_COMPILED_BYTES} cap. " \
      "This legacy bundle must not grow: put new frontend code in apps/ or frontend/ instead. " \
      "See dashboard/app/assets/javascripts/application.js.erb."
  end
end
