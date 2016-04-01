namespace :adhoc do

  task :environment do
    require_relative '../../deployment'
    CDO.chef_local_mode = true
    ENV['RAILS_ENV'] = ENV['RACK_ENV'] = CDO.rack_env = 'adhoc'
    require 'cdo/aws/cloud_formation'
  end

  namespace :start do

    task default: :environment do
      AWS::CloudFormation.create_or_update
    end

    desc 'Launch an adhoc server, with CloudFront CDN enabled.
Note: Consumes AWS resources until `adhoc:stop` is called.'
    task cdn: :environment do
      AWS::CloudFormation.create_or_update(true)
    end

  end

  desc 'Launch an adhoc server.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  task start: ['start:default']

  desc 'Stop an adhoc server. Clean up all consumed AWS resources'
  task stop: :environment do
    AWS::CloudFormation.delete
  end

  desc 'Validate CloudFormation template.'
  task validate: :environment do
    AWS::CloudFormation.validate
  end

end
