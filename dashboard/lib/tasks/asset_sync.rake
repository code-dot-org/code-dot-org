namespace :assets do
  desc 'Synchronize assets to S3'
  task sync: :environment do
    require 'cdo/rake_utils'
    # AWS CLI implements an optimized `sync` utility without any Ruby SDK equivalent.
    cmd = "aws s3 sync #{dashboard_dir}/public/assets s3://#{CDO.assets_bucket}/#{CDO.assets_bucket_prefix}/assets --acl public-read --cache-control 'max-age=31536000'"
    RakeUtils.system cmd
  end

  # Precompile application.js with js_compressor.
  task precompile_application_js: :environment do
    app = Rails.application
    app.config.assets.js_compressor = :uglifier
    app.assets = Sprockets::Railtie.build_environment(app)
    Sprockets::Railtie.build_manifest(app).compile('application.js')
  end

  desc 'Copy digested assets to non-digested file paths'
  task no_digests: :environment do
    # For example, files that look like:
    #   public/assets/js/some-imagewp<webpack-hash>-<rails-digest>.png
    # will be copied to
    #   public/assets/js/some-imagewp<webpack-hash>.png
    #
    # this is necessary because webpack doesn't have any knowledge of
    # the rails digests, so any images that get imported in javascript
    # will reference the undigested file paths in the production js bundles.
    # webpack adds it's own hash to filenames for imported images to get
    # cache busting behavior, so there is absolutely no need for the rails
    # digest to be added to these files. Unfortunately, there is no way to
    # tell rails which files to digest and which to not digest, so we
    # have to do this nonsense.
    assets = Dir.glob("#{dashboard_dir}/public/assets/js/**/*")
    regex = /(^.*)-\w{32,64}(\.\w+$)/
    assets.each do |file|
      next if File.directory?(file) || file !~ regex
      non_digested = file.gsub(regex, '\1\2')
      puts "Copying file #{file} to #{non_digested}"
      FileUtils.cp(file, non_digested)
    end
  end
end

Rake::Task['assets:precompile'].enhance do
  Rake::Task['assets:precompile_application_js'].invoke
  Rake::Task['assets:no_digests'].invoke
  Rake::Task['assets:sync'].invoke if CDO.cdn_enabled
end
