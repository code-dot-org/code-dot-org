namespace :assets do
  desc 'Synchronize assets to S3'
  task sync: :environment do
    require 'cdo/rake_utils'
    # AWS CLI implements an optimized `sync` utility without any Ruby SDK equivalent.
    cmd = "aws s3 sync #{dashboard_dir}/public/assets s3://#{CDO.assets_bucket}/#{rack_env}/assets --acl public-read --cache-control 'max-age=31536000'"
    RakeUtils.system cmd
  end

  # Precompile application.js with js_compressor.
  task precompile_application_js: :environment do
    app = Rails.application
    app.config.assets.js_compressor = :uglifier
    app.assets = Sprockets::Railtie.build_environment(app)
    Sprockets::Railtie.build_manifest(app).compile('application.js')
  end
end

Rake::Task['assets:precompile'].enhance do
  Rake::Task['assets:precompile_application_js'].invoke
  Rake::Task['assets:sync'].invoke if CDO.cdn_enabled
end
