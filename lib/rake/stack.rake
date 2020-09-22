namespace :stack do
  task :environment do
    ENV['CDN_ENABLED'] ||= '1' unless rack_env?(:adhoc)
    ENV['DOMAIN'] ||= rack_env?(:adhoc) ? 'cdn-code.org' : 'code.org'
    Dir.chdir aws_dir('cloudformation')
    require 'cdo/aws/cloud_formation'
    require 'cdo/cloud_formation/cdo_app'
    @cfn = AWS::CloudFormation.new(
      stack: (@stack = Cdo::CloudFormation::CdoApp.new(
        filename: ENV['TEMPLATE'],
        stack_name: ENV['STACK_NAME'].dup,
        frontends: ENV['FRONTENDS'],
        domain: ENV['DOMAIN'],
        cdn_enabled: ENV['CDN_ENABLED'],
        commit: ENV['COMMIT']
      )),
      log: CDO.log,
      verbose: ENV['VERBOSE'],
      quiet: ENV['QUIET'],
      import_resources: ENV['IMPORT_RESOURCES'],
    )
  end

  namespace :start do
    task default: :environment do
      @cfn.create_or_update
    end

    desc 'Launch/update a full-stack deployment with CloudFront CDN disabled.
Note: Consumes AWS resources until `stack:stop` is called.'
    task no_cdn: :environment do
      @stack.options[:cdn_enabled] = false
      @cfn.create_or_update
    end
  end

  desc 'Launch/update a full-stack deployment.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  task start: ['start:default']

  # `stop` command intentionally removed. Use AWS console to manually delete stacks.

  desc 'Validate CloudFormation template.'
  task validate: :environment do
    @cfn.validate
  end

  # Managed resource stacks other than the Code.org application.
  %I(vpc iam ami data lambda alerting).each do |stack|
    namespace stack do
      task :environment do
        stack_name = ENV['STACK_NAME']
        stack_name ||= stack.to_s if [:lambda, :alerting].include? stack
        stack_name ||= "#{stack.upcase}#{"-#{rack_env}" if [:ami, :data].include? stack}"

        Dir.chdir aws_dir('cloudformation')
        require 'cdo/aws/cloud_formation'
        require 'cdo/cloud_formation/stack_template'
        @cfn = AWS::CloudFormation.new(
          stack: Cdo::CloudFormation::StackTemplate.new(
            filename: ENV['TEMPLATE'] || "#{stack}.yml.erb",
            stack_name: stack_name
          ),
          log: CDO.log,
          verbose: ENV['VERBOSE'],
          quiet: ENV['QUIET'],
          import_resources: ENV['IMPORT_RESOURCES'],
        )
      end

      desc "Launch/update #{stack} stack component."
      task start: :environment do
        @cfn.create_or_update
      end

      desc "Validate #{stack} stack template."
      task validate: :environment do
        @cfn.validate
      end

      # `stop` command intentionally removed. Use AWS console to manually delete stacks.
    end
  end
end
