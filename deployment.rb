$LOAD_PATH.unshift File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift File.expand_path('../shared/middleware', __FILE__)

# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __FILE__)
require 'bundler/setup' if File.exist?(ENV['BUNDLE_GEMFILE'])

require 'csv'
require 'yaml'
require 'cdo/erb'
require 'cdo/slog'
require 'os'
require 'cdo/aws/cdo_google_credentials'
require 'cdo/git_utils'

def load_yaml_file(path)
  return nil unless File.file?(path)
  YAML.load(IO.read(path))
end

def load_languages(path)
  [].tap do |results|
    CSV.foreach(path, headers: true, encoding: 'utf-8') do |row|
      results << row['code_s!']
    end
  end
end

def load_configuration
  root_dir = File.expand_path('..', __FILE__)
  root_dir = '/home/ubuntu/website-ci' if root_dir == '/home/ubuntu/Dropbox (Code.org)'

  hostname = `hostname`.strip

  global_config = load_yaml_file(File.join(root_dir, 'globals.yml')) || {}
  local_config = load_yaml_file(File.join(root_dir, 'locals.yml')) || {}

  env = local_config['env'] || global_config['env'] || ENV['RACK_ENV'] || ENV['RAILS_ENV'] || 'development'

  rack_env = env.to_sym

  {
    'app_servers'                 => {},
    'assets_bucket'               => 'cdo-dist',
    'assets_bucket_prefix'        => rack_env.to_s,
    'aws_region'                  => 'us-east-1',
    'build_apps'                  => false,
    'build_dashboard'             => true,
    'build_pegasus'               => true,
    'census_map_table_id'         => rack_env == :development ? nil : '1AUZYRjLMI5NiQsDeDBGFsOIFpL_rLGsnxNpSyR13',
    'chef_local_mode'             => rack_env == :adhoc,
    'dcdo_table_name'             => "dcdo_#{rack_env}",
    'dashboard_assets_dir'        => "#{root_dir}/dashboard/public/assets",
    'dashboard_db_name'           => "dashboard_#{rack_env}",
    'dashboard_devise_pepper'     => 'not a pepper!',
    'dashboard_secret_key_base'   => 'not a secret',
    'dashboard_honeybadger_api_key' => '00000000',
    'dashboard_host'              => '0.0.0.0',
    'dashboard_port'              => 3000,
    'dashboard_unicorn_name'      => 'dashboard',
    'dashboard_enable_pegasus'    => rack_env == :development,
    'dashboard_workers'           => 8,
    'db_writer'                   => 'mysql://root@localhost/',
    'default_hoc_mode'            => false, # overridden by 'hoc_mode' DCDO param, except in :test
    'reporting_db_writer'         => 'mysql://root@localhost/',
    'gatekeeper_table_name'       => "gatekeeper_#{rack_env}",
    'slack_log_room'              => rack_env.to_s,
    'hip_chat_logging'            => false,
    'languages'                   => load_languages(File.join(root_dir, 'pegasus', 'data', 'cdo-languages.csv')),
    'localize_apps'               => false,
    'name'                        => hostname,
    'newrelic_logging'            => rack_env == :production,
    'netsim_max_routers'          => 20,
    'netsim_shard_expiry_seconds' => 7200,
    'partners'                    => %w(ar br italia ro sg tr uk za),
    'pdf_port_collate'            => 8081,
    'pdf_port_markdown'           => 8081,
    'pegasus_db_name'             => rack_env == :production ? 'pegasus' : "pegasus_#{rack_env}",
    'pegasus_honeybadger_api_key' => '00000000',
    'pegasus_port'                => 3000,
    'pegasus_unicorn_name'        => 'pegasus',
    'pegasus_workers'             => 8,
    'poste_host'                  => 'localhost.code.org:3000',
    'pegasus_skip_asset_map'      => rack_env == :development,
    'poste_secret'                => 'not a real secret',
    'proxy'                       => false, # If true, generated URLs will not include explicit port numbers in development
    'rack_env'                    => rack_env,
    'rack_envs'                   => [:development, :production, :adhoc, :staging, :test, :levelbuilder, :integration],
    'read_only'                   => false,
    'ruby_installer'              => rack_env == :development ? 'rbenv' : 'system',
    'root_dir'                    => root_dir,
    'dynamo_tables_table'         => "#{rack_env}_tables",
    'dynamo_properties_table'     => "#{rack_env}_properties",
    'dynamo_table_metadata_table' => "#{rack_env}_table_metadata",
    'firebase_name'               => rack_env == :development ? 'cdo-v3-dev' : nil,
    'firebase_secret'             => nil,
    'firebase_max_channel_writes_per_15_sec' => 300,
    'firebase_max_channel_writes_per_60_sec' => 600,
    'firebase_max_table_count'    => 10,
    'firebase_max_table_rows'     => 1000,
    'firebase_max_record_size'    => 4096,
    'firebase_max_property_size'  => 4096,
    'lint'                        => [:staging, :development].include?(rack_env),
    'files_s3_bucket'             => 'cdo-v3-files',
    'files_s3_directory'          => rack_env == :production ? 'files' : "files_#{rack_env}",
    'animations_s3_bucket'        => 'cdo-v3-animations',
    'animations_s3_directory'     => rack_env == :production ? 'animations' : "animations_#{rack_env}",
    'assets_s3_bucket'            => 'cdo-v3-assets',
    'assets_s3_directory'         => rack_env == :production ? 'assets' : "assets_#{rack_env}",
    'sources_s3_bucket'           => 'cdo-v3-sources',
    'sources_s3_directory'        => sources_s3_dir,
    'use_pusher'                  => false,
    'pusher_app_id'               => 'fake_app_id',
    'pusher_application_key'      => 'fake_application_key',
    'pusher_application_secret'   => 'fake_application_secret',
    'stub_school_data'            => [:adhoc, :development, :test].include?(rack_env),
    'stack_name'                  => rack_env == :production ? 'autoscale-prod' : rack_env.to_s,
    'videos_s3_bucket'            => 'videos.code.org',
    'videos_url'                  => '//videos.code.org'
  }.tap do |config|
    raise "'#{rack_env}' is not known environment." unless config['rack_envs'].include?(rack_env)
    ENV['RACK_ENV'] = rack_env.to_s unless ENV['RACK_ENV']
    #raise "RACK_ENV ('#{ENV['RACK_ENV']}') does not match configuration ('#{rack_env}')" unless ENV['RACK_ENV'] == rack_env.to_s

    config['bundler_use_sudo'] = config['ruby_installer'] == 'system'

    # test environment should use precompiled, minified, digested assets like production,
    # unless it's being used for unit tests. This logic should be kept in sync with
    # the logic for setting config.assets.* under dashboard/config/.
    ci_test = !!(ENV['UNIT_TEST'] || ENV['CI'])
    config['pretty_js'] = [:development, :staging].include?(rack_env) || (rack_env == :test && ci_test)

    config.merge! global_config
    config.merge! local_config

    config['channels_api_secret'] ||= config['poste_secret']
    config['daemon']              ||= [:development, :levelbuilder, :staging, :test].include?(rack_env) || config['name'] == 'production-daemon'
    config['cdn_enabled']         ||= config['chef_managed']

    config['db_reader']           ||= config['db_writer']
    config['reporting_db_reader'] ||= config['reporting_db_writer']
    config['dashboard_db_reader'] ||= config['db_reader'] + config['dashboard_db_name']
    config['dashboard_db_writer'] ||= config['db_writer'] + config['dashboard_db_name']
    config['dashboard_reporting_db_reader'] ||= config['reporting_db_reader'] + config['dashboard_db_name']
    config['dashboard_reporting_db_writer'] ||= config['reporting_db_writer'] + config['dashboard_db_name']
    config['pegasus_db_reader']   ||= config['db_reader'] + config['pegasus_db_name']
    config['pegasus_db_writer']   ||= config['db_writer'] + config['pegasus_db_name']
    config['pegasus_reporting_db_reader'] ||= config['reporting_db_reader'] + config['pegasus_db_name']
    config['pegasus_reporting_db_writer'] ||= config['reporting_db_writer'] + config['pegasus_db_name']

    config['image_optim'] = config['chef_managed'] && !ci_test if config['image_optim'].nil?

    # Set AWS SDK environment variables from provided config and standardize on aws_* attributres
    ENV['AWS_ACCESS_KEY_ID'] ||= config['aws_access_key'] ||= config['s3_access_key_id']
    ENV['AWS_SECRET_ACCESS_KEY'] ||= config['aws_secret_key'] ||= config['s3_secret_access_key']

    # AWS Ruby SDK doesn't auto-detect region from EC2 Instance Metadata.
    # Ref: https://github.com/aws/aws-sdk-ruby/issues/1455
    ENV['AWS_DEFAULT_REGION'] ||= config['aws_region']
  end
end

####################################################################################################
##
## CDO - A singleton that contains our settings and integration helpers.
##
##########

class CDOImpl < OpenStruct
  @slog = nil

  def initialize
    super load_configuration
  end

  def canonical_hostname(domain)
    # Allow hostname overrides
    return CDO.override_dashboard if CDO.override_dashboard && domain == 'studio.code.org'
    return CDO.override_pegasus if CDO.override_pegasus && domain == 'code.org'

    return "#{name}.#{domain}" if ['console', 'hoc-levels'].include?(name)
    return domain if rack_env?(:production)

    # our HTTPS wildcard certificate only supports *.code.org
    # 'env', 'studio.code.org' over https must resolve to 'env-studio.code.org' for non-prod environments
    sep = (domain.include?('.code.org')) ? '-' : '.'
    return "localhost#{sep}#{domain}" if rack_env?(:development)
    return "translate#{sep}#{domain}" if name == 'crowdin'
    "#{rack_env}#{sep}#{domain}"
  end

  def dashboard_hostname
    canonical_hostname('studio.code.org')
  end

  def pegasus_hostname
    canonical_hostname('code.org')
  end

  def hourofcode_hostname
    canonical_hostname('hourofcode.com')
  end

  def advocacy_hostname
    canonical_hostname('advocacy.code.org')
  end

  def circle_run_identifier
    ENV['CIRCLE_BUILD_NUM'] ? "CIRCLE-BUILD-#{ENV['CIRCLE_BUILD_NUM']}-#{ENV['CIRCLE_NODE_INDEX']}" : nil
  end

  # provide a unique path for firebase channels data for development and circleci,
  # to avoid conflicts in channel ids.
  def firebase_channel_id_suffix
    return "-#{circle_run_identifier}" if ENV['CI']
    return "-DEVELOPMENT-#{ENV['USER']}" if CDO.firebase_name == 'cdo-v3-dev'
    ''
  end

  def site_host(domain)
    host = canonical_hostname(domain)
    if (rack_env?(:development) && !CDO.https_development) ||
      (ENV['CI'] && host.include?('localhost'))
      port = ['studio.code.org'].include?(domain) ? CDO.dashboard_port : CDO.pegasus_port
      host += ":#{port}"
    end
    host
  end

  def site_url(domain, path = '', scheme = '')
    path = '/' + path unless path.empty? || path[0] == '/'
    "#{scheme}//#{site_host(domain)}#{path}"
  end

  def studio_url(path = '', scheme = '')
    site_url('studio.code.org', path, scheme)
  end

  def code_org_url(path = '', scheme = '')
    site_url('code.org', path, scheme)
  end

  def advocacy_url(path = '', scheme = '')
    site_url('advocacy.code.org', path, scheme)
  end

  def default_scheme
    rack_env?(:development) || ENV['CI'] ? 'http:' : 'https:'
  end

  def dir(*dirs)
    File.join(root_dir, *dirs)
  end

  def hosts_by_env(env)
    hosts = []
    GlobalConfig['hosts'].each_pair do |_key, i|
      hosts << i if i['env'] == env.to_s
    end
    hosts
  end

  def hostnames_by_env(env)
    hosts_by_env(env).map {|i| i['name']}
  end

  def rack_env?(env)
    rack_env.to_sym == env.to_sym
  end

  # Sets the slogger to use in a test.
  # slogger must support a `write` method.
  def set_slogger_for_test(slogger)
    @slog = slogger
    # Set a fake slog token so that the slog method will actually call
    # the test slogger.
    CDO.slog_token = 'fake_slog_token'
  end

  def slog(params)
    return unless slog_token && Gatekeeper.allows('slogging', default: true)
    @slog ||= Slog::Writer.new(secret: slog_token)
    @slog.write params
  end

  def shared_image_url(path)
    "/shared/images/#{path}"
  end

  # Default logger implementation
  attr_writer :log
  def log
    @log ||= Logger.new(STDOUT).tap do |l|
      l.level = Logger::INFO
      l.formatter = proc do |severity, _, _, msg|
        "#{severity != 'INFO' ? "#{severity}: " : ''}#{msg}\n"
      end
    end
  end

  # Simple backtrace filter
  FILTER_GEMS = %w(rake).freeze

  def backtrace(exception)
    filter_backtrace exception.backtrace
  end

  def filter_backtrace(backtrace)
    FILTER_GEMS.map do |gem|
      backtrace.reject! {|b| b =~ /gems\/#{gem}/}
    end
    backtrace.each do |b|
      b.gsub!(CDO.dir, '[CDO]')
      Gem.path.each do |gem|
        b.gsub!(gem, '[GEM]')
      end
      b.gsub! Bundler.system_bindir, '[BIN]'
    end
    backtrace.join("\n")
  end

  class DelegateWithDefault < SimpleDelegator
    def initialize(target, default_value)
      @default_value = default_value
      super(target)
    end

    def method_missing(*args)
      return @default_value unless __getobj__.respond_to? args.first
      value = super
      return @default_value if value.nil?
      value
    end
  end

  def with_default(default_value)
    DelegateWithDefault.new(self, default_value)
  end

  # When running on Chef Server, use EC2 API to fetch a dynamic list of app-server front-ends,
  # appending to the static list already provided by configuration files.
  def app_servers
    return super unless CDO.chef_managed
    require 'aws-sdk'
    servers = Aws::EC2::Client.new.describe_instances(
      filters: [
        {name: 'tag:aws:cloudformation:stack-name', values: [CDO.stack_name]},
        {name: 'tag:aws:cloudformation:logical-id', values: ['Frontends']},
        {name: 'instance-state-name', values: ['running']}
      ]
    ).reservations.map(&:instances).flatten.map {|i| ["fe-#{i.instance_id}", i.private_dns_name]}.to_h
    servers.merge(super)
  end
end

CDO ||= CDOImpl.new

####################################################################################################
##
## Helpers
##
##########

def rack_env
  CDO.rack_env.to_sym
end

def rack_env?(*env)
  e = *env
  e.include? rack_env.to_sym
end

def with_rack_env(temporary_env)
  previous_env = CDO.rack_env
  CDO.rack_env = temporary_env
  yield
  CDO.rack_env = previous_env
end

def deploy_dir(*dirs)
  CDO.dir(*dirs)
end

def aws_dir(*dirs)
  deploy_dir('aws', *dirs)
end

def apps_dir(*dirs)
  deploy_dir('apps', *dirs)
end

def tools_dir(*dirs)
  deploy_dir('tools', *dirs)
end

def cookbooks_dir(*dirs)
  deploy_dir('cookbooks', *dirs)
end

def dashboard_dir(*dirs)
  deploy_dir('dashboard', *dirs)
end

def pegasus_dir(*paths)
  deploy_dir('pegasus', *paths)
end

def shared_dir(*dirs)
  deploy_dir('shared', *dirs)
end

def shared_js_dir(*dirs)
  deploy_dir('shared/js', *dirs)
end

def lib_dir(*dirs)
  deploy_dir('lib', *dirs)
end

# Since channel ids are derived from user id and other sequential integer ids
# use a new S3 sources directory for each Test Build to prevent a UI test
# from inadvertently using a channel id from a previous Test Build.
# CircleCI environments already suffix the Circle Build number on the sources directory:
# https://github.com/code-dot-org/code-dot-org/blob/fb53af48ec0598692ed19f340f26d2ed0bd9547b/.circleci/config.yml#L153
def sources_s3_dir
  if rack_env == :production
    'sources'
  elsif rack_env == :test && !ENV[CI]
    "sources_#{rack_env}/#{GitUtils.git_revision_short}"
  else
    "sources_#{rack_env}"
  end
end
