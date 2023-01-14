namespace :assets do
  def manifest
    app = Rails.application
    app.assets = Sprockets::Railtie.build_environment(app)
    Sprockets::Railtie.build_manifest(app)
  end

  # Record files already in manifest before current precompile run.
  task record_manifest_files: :environment do
    @manifest_files = manifest.files
  end

  desc 'Synchronize newly-added assets to S3'
  task sync: :record_manifest_files do
    m = manifest

    # Only compare digest to determine whether a path has changed.
    new_files = m.files.transform_values {|f| f['digest']}.to_a
    old_files = @manifest_files.transform_values {|f| f['digest']}.to_a

    changed_paths = (new_files - old_files).
      map {|key, _| [key, File.join(m.dir, key)]}.to_h
    next if changed_paths.empty?

    puts "Copying #{changed_paths.length} new assets to s3://#{CDO.assets_bucket}/#{CDO.assets_bucket_prefix}/assets/"
    require 'aws-sdk-s3'
    require 'parallel'
    bucket = Aws::S3::Resource.new.bucket(CDO.assets_bucket)
    Parallel.each(changed_paths, in_threads: 16) do |key, path|
      bucket.object("#{CDO.assets_bucket_prefix}/assets/#{key}").upload_file(
        path,
        acl: 'public-read',
        cache_control: 'max-age=31536000',
        content_type: Rack::Mime.mime_type(File.extname(key))
      )
    end
  rescue
    if m && changed_paths
      puts "Removing #{changed_paths.length} new assets because S3 sync failed.
Rerun `assets:precompile` to regenerate new assets and try again."
      changed_paths.each {|key, _| m.remove(key)}
    end
    raise
  end

  # Precompile application.js with js_compressor.
  task precompile_application_js: :environment do
    Rails.application.config.assets.js_compressor = :uglifier
    manifest.compile('application.js')
  end

  # Patch Sprockets to skip digesting already-digested webpack ('wp') assets.
  # Webpack adds its own hash to various files and doesn't have any
  # knowledge of Sprockets digests, so the Sprockets processed-asset digest
  # path should equal the logical path for these assets.
  #
  # This means that the digest for these assets is based on the webpack content
  # and not the Sprockets-processed output, so the wp-digest will not get
  # updated if there are any changes to Sprockets processors.
  module NoDoubleDigest
    def digest_path
      logical_path.match?(WP_REGEX) ? logical_path : super
    end
  end
  Sprockets::Asset.prepend NoDoubleDigest

  # Patch Sprockets to un-digest logical paths being saved to manifest on disk.
  # This allows webpack asset versions to be grouped together and deleted as expected by `assets:clean`.
  module UnDigestManifest
    def json_encode(obj)
      obj['files'].each {|_, attrs| attrs['logical_path'].sub!(WP_REGEX, '')}
      super
    end
  end
  Sprockets::Manifest.prepend UnDigestManifest

  # The webpack hash can be either a 20- or 32-character hexadecimal string.
  # Search Gruntfile.js and webpack.js for [hash] and [contenthash] to
  # see when webpack might generate content hashes of each length.
  WP_REGEX = /wp\h{20,32}/
end

Rake::Task['assets:precompile'].enhance([:record_manifest_files]) do
  Rake::Task['assets:precompile_application_js'].invoke
  Rake::Task['assets:sync'].invoke if CDO.cdn_enabled
end
