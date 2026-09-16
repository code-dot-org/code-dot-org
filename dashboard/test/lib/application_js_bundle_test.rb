require 'test_helper'

# application.js is a frozen legacy bundle: no minifier runs in the asset
# pipeline, so it ships pre-minified sources plus small unminified glue.
# Changes are limited to security updates; new frontend code belongs in
# apps/ or frontend/.
class ApplicationJsBundleTest < ActiveSupport::TestCase
  # ~494KB today; headroom is for patch-level gem drift, not new dependencies.
  MAX_COMPILED_BYTES = 510_000

  # sha256 of https://code.jquery.com/ui/1.12.1/jquery-ui.min.js, verbatim.
  JQUERY_UI_SHA256 = '55accff7b642c2d7a402cbe03c1494c0f14a76bc03dee9d47d219562b6a152a5'.freeze

  def test_bundle_does_not_grow
    env = Sprockets::Railtie.build_environment(Rails.application)
    size = env.find_asset('application.js').source.bytesize
    assert_operator size, :<=, MAX_COMPILED_BYTES,
      "application.js compiled to #{size} bytes, over the #{MAX_COMPILED_BYTES} cap. " \
      "This legacy bundle must not grow: put new frontend code in apps/ or frontend/ instead. " \
      "See dashboard/app/assets/javascripts/application.js.erb."
  end

  def test_vendored_jquery_ui_is_the_official_build
    path = Rails.root.join('vendor/assets/javascripts/jquery-ui.min.js')
    digest = Digest::SHA256.file(path).hexdigest
    assert_equal JQUERY_UI_SHA256, digest,
      'vendor/assets/javascripts/jquery-ui.min.js no longer matches the official ' \
      'jQuery UI 1.12.1 build (https://code.jquery.com/ui/1.12.1/jquery-ui.min.js). ' \
      'Replace it with the verbatim upstream file, or update this pin deliberately ' \
      'alongside the jquery-ui-rails gem version.'
  end
end
