namespace :assets do
  def manifest
    app = Rails.application
    app.assets = Sprockets::Railtie.build_environment(app)
    Sprockets::Railtie.build_manifest(app)
  end

  desc 'Synchronize newly-added assets to S3'
  task sync: :changed do
    next if @changed_paths.empty?
    puts "Copying #{@changed_paths.length} new assets to s3://#{CDO.assets_bucket}/#{CDO.assets_bucket_prefix}/assets/ : #{@changed_paths}"
    require 'aws-sdk-s3'
    require 'parallel'
    bucket = Aws::S3::Resource.new.bucket(CDO.assets_bucket)
    Parallel.each(@changed_paths, in_threads: 16) do |key, path|
      bucket.object("#{CDO.assets_bucket_prefix}/assets/#{key}").upload_file(path, acl: 'public-read', cache_control: 'max-age=31536000')
    end
  rescue
    puts "Deleting #{@changed_paths.length} new assets because S3 sync failed.
Rerun `assets:precompile` to regenerate new assets and try again."
    FileUtils.rm @changed_paths.values
    raise
  end

  # Precompile application.js with js_compressor.
  task precompile_application_js: :environment do
    Rails.application.config.assets.js_compressor = :uglifier
    manifest.compile('application.js')
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
    # webpack adds its own hash to filenames for imported images to get
    # cache busting behavior, so there is absolutely no need for the rails
    # digest to be added to these files. Unfortunately, there is no way to
    # tell rails which files to digest and which to not digest, so we
    # have to do this nonsense.
    assets = Dir.glob("#{dashboard_dir}/public/assets/js/**/*")
    regex = /(^.*)-\w{32,64}(\.\w+$)/
    assets.each do |file|
      next if File.directory?(file) || file !~ regex
      non_digested = file.gsub(regex, '\1\2')
      next if File.exist?(non_digested)
      puts "Copying file #{file} to #{non_digested}"
      FileUtils.cp(file, non_digested)
    end
  end

  task record_manifest_files: :environment do
    @manifest_files = manifest.files
  end

  task changed: :record_manifest_files do
    m = manifest
    @changed_paths = (m.files.to_a - @manifest_files.to_a).
      map {|key, _| [key, File.join(m.dir, key)]}.to_h
  end
end

Rake::Task['assets:precompile'].enhance([:record_manifest_files]) do
  Rake::Task['assets:precompile_application_js'].invoke
  Rake::Task['assets:no_digests'].invoke
  Rake::Task['assets:sync'].invoke if CDO.cdn_enabled
end
