namespace :assets do
  desc 'Synchronize assets to S3'
  task :sync => :environment do
    require 'cdo/rake_utils'
    # AWS CLI implements an optimized `sync` utility without any Ruby SDK equivalent.
    cmd = "aws s3 sync #{dashboard_dir}/public/assets s3://#{CDO.assets_bucket}/#{rack_env}/assets --acl public-read --cache-control 'max-age=31536000'"
    RakeUtils.system cmd
  end

  desc 'Fetch the latest assets manifest from S3'
  task :manifest => :environment do
    manifest = Aws::S3::Resource.new
      .bucket(CDO.assets_bucket)
      .objects(prefix: "#{rack_env}/assets/.sprockets-manifest-")
      .to_a.max_by(&:last_modified)
    # Overwrite the local Sprockets manifest with the fetched contents.
    manifest.get(response_target: Rails.application.assets_manifest.filename)
  end
end

Rake::Task['assets:precompile'].enhance do
  Rake::Task['assets:sync'].invoke if CDO.sync_assets
end
