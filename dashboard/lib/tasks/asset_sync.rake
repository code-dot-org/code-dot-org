namespace :assets do
  desc 'Synchronize assets to S3'
  task :sync => :environment do
    require 'cdo/rake_utils'
    # AWS CLI implements an optimized `sync` utility without any Ruby SDK equivalent.
    cmd = "aws s3 sync #{dashboard_dir}/public/assets s3://#{CDO.assets_bucket}/#{rack_env}/assets --acl public-read --cache-control 'max-age=31536000'"
    RakeUtils.system cmd
  end
end

Rake::Task['assets:precompile'].enhance do
  Rake::Task['assets:sync'].invoke if CDO.sync_assets
end
