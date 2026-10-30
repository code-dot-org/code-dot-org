# Ensure we pick up our local `BUNDLE_GEMFILE` override before Bundler reads
# the lockfile, or it will treat the `dashboard/Gemfile` symlink as the real
# thing and rewrite the shared `Gemfile.lock` accordingly.
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../../Gemfile', __FILE__)
