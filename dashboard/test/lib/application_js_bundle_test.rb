require 'test_helper'

# application.js is a frozen legacy bundle. No minifier runs in the asset
# pipeline (uglifier/execjs/mini_racer were removed in PR #74525), so it is
# assembled from pre-minified sources plus a few small unminified glue files.
# The bundle is frozen: changes are limited to security updates of what is
# already in it, and new frontend code belongs in apps/ or frontend/. The
# size cap catches accidental growth at PR time; the digest pins the
# vendored jquery-ui build to the official upstream artifact.
class ApplicationJsBundleTest < ActiveSupport::TestCase
  # Compiled size is ~494KB today; headroom covers patch-level drift in the
  # pinned gems, not new dependencies.
  MAX_COMPILED_BYTES = 510_000

  # sha256 of https://code.jquery.com/ui/1.12.1/jquery-ui.min.js (official
  # jQuery UI 1.12.1 full build, verbatim).
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
