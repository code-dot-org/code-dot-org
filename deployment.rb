$:.unshift File.expand_path('../lib', __FILE__)
$:.unshift File.expand_path('../shared/middleware', __FILE__)
require 'csv'
require 'yaml'
require 'cdo/erb'
require 'cdo/slog'
require 'os'

def load_yaml_file(path)
  return nil unless File.file?(path)
  YAML.load(IO.read(path))
end

def load_languages(path)
  [].tap do |results|
    CSV.foreach(path, headers:true) do |row|
      results << row['code_s!']
    end
  end
end

def load_configuration()
  root_dir = File.expand_path('..', __FILE__)
  root_dir = '/home/ubuntu/website-ci' if root_dir == '/home/ubuntu/Dropbox (Code.org)'

  hostname = `hostname`.strip

  global_config = load_yaml_file File.join(root_dir, 'aws', 'secrets', 'config.yml')
  global_config = {'environments'=>{}, 'hosts'=>{}} unless global_config

  default_config = global_config['environments']['all'] || {}

  host_config = global_config['hosts'][hostname] || {}

  local_config = load_yaml_file(File.join(root_dir, 'locals.yml')) || {}

  env = local_config['env'] || host_config['env'] || ENV['RACK_ENV'] || ENV['RAILS_ENV'] || 'development'
  env_config = global_config['environments'][env] || {}

  rack_env = env.to_sym

  {
    'app_servers'                 => {},
    'build_apps'               => false,
    'build_blockly_core'          => false,
    'build_dashboard'             => true,
    'build_pegasus'               => true,
    'dashboard_db_name'           => "dashboard_#{rack_env}",
    'dashboard_devise_pepper'     => 'not a pepper!',
    'dashboard_secret_key_base'   => 'not a secret',
    'dashboard_honeybadger_api_key' =>'00000000',
    'dashboard_port'              => 3000,
    'dashboard_unicorn_name'      => 'dashboard',
    'dashboard_workers'           => 8,
    'db_reader'                   => 'mysql://root@localhost/',
    'db_writer'                   => 'mysql://root@localhost/',
    'hip_chat_log_room'           => rack_env.to_s,
    'hip_chat_logging'            => false,
    'home_dir'                    => File.expand_path('~'),
    'languages'                   => load_languages(File.join(root_dir, 'pegasus', 'data', 'cdo-languages.csv')),
    'localize_apps'            => false,
    'name'                        => hostname,
    'npm_use_sudo'                => ((rack_env != :development) && OS.linux?),
    'pegasus_db_name'             => rack_env == :production ? 'pegasus' : "pegasus_#{rack_env}",
    'pegasus_honeybadger_api_key' =>'00000000',
    'pegasus_port'                => 9393,
    'pegasus_unicorn_name'        => 'pegasus',
    'pegasus_workers'             => 4,
    'poste_host'                  => 'localhost.code.org:9393',
    'poste_secret'                => 'not a real secret',
    'rack_env'                    => rack_env,
    'rack_envs'                   => [:development, :production, :staging, :test, :levelbuilder],
    'read_only'                   => false,
    'ruby_installer'              => rack_env == :development ? 'rbenv' : 'system',
    'root_dir'                    => root_dir,
    'sendy_db_reader'             => 'mysql://root@localhost/',
    'sendy_db_writer'             => 'mysql://root@localhost/',
    'varnish_instances'           => [],
  }.tap do |config|
    raise "'#{rack_env}' is not known environment." unless config['rack_envs'].include?(rack_env)
    ENV['RACK_ENV'] = rack_env.to_s unless ENV['RACK_ENV']
    raise "RACK_ENV ('#{ENV['RACK_ENV']}') does not match configuration ('#{rack_env}')" unless ENV['RACK_ENV'] == rack_env.to_s

    config['bundler_use_sudo'] = config['ruby_installer'] == 'system'

    config.merge! default_config
    config.merge! env_config
    config.merge! host_config
    config.merge! local_config

    config['daemon']              ||= [:development, :levelbuilder, :staging, :test].include?(rack_env) || config['name'] == 'daemon'
    config['dashboard_db_reader'] ||= config['db_reader'] + config['dashboard_db_name']
    config['dashboard_db_writer'] ||= config['db_writer'] + config['dashboard_db_name']
    config['pegasus_db_reader']   ||= config['db_reader'] + config['pegasus_db_name']
    config['pegasus_db_writer']   ||= config['db_writer'] + config['pegasus_db_name']
  end
end


####################################################################################################
##
## CDO - A singleton that contains our settings and integration helpers.
##
##########

class CDOImpl < OpenStruct

  @slog = nil

  def initialize()
    super load_configuration
  end

  def canonical_hostname(domain)
    return "localhost.#{domain}" if rack_env?(:development)
    return "#{self.name}.#{domain}" if ['console', 'hoc-levels'].include?(self.name)
    return domain if rack_env?(:production)
    "#{rack_env}.#{domain}"
  end

  def site_url(domain, path = '')
    host = canonical_hostname(domain)
    if rack_env?(:development)
      port = ['studio.code.org'].include?(domain) ? CDO.dashboard_port : CDO.pegasus_port
      host += ":#{port}"
    end

    path = '/' + path unless path.empty? || path[0] == '/'
    return "//#{host}#{path}"
  end

  def studio_url(path = '')
    site_url('studio.code.org', path)
  end

  def code_org_url(path = '')
    site_url('code.org', path)
  end

  def dir(*dirs)
    File.join(root_dir, *dirs)
  end

  def hosts_by_env(env)
    hosts = []
    GlobalConfig['hosts'].each_pair do |key, i|
      hosts << i if i['env'] == env.to_s
    end
    hosts
  end

  def hostnames_by_env(env)
    hosts_by_env(env).map{|i| i['name']}
  end

  def rack_env?(env)
    rack_env == env
  end

  def slog(params)
    return unless slog_token
    @slog ||= Slog::Writer.new(secret:slog_token)
    @slog.write params
  end

end

CDO ||= CDOImpl.new


####################################################################################################
##
## Helpers
##
##########

def rack_env()
  CDO.rack_env
end

def rack_env?(env)
  rack_env == env
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

def blockly_core_dir(*dirs)
  deploy_dir('blockly-core', *dirs)
end

def dashboard_dir(*dirs)
  deploy_dir('dashboard', *dirs)
end

def home_dir(*paths)
  File.join(CDO.home_dir, *paths)
end

def pegasus_dir(*paths)
  deploy_dir('pegasus', *paths)
end

def secrets_dir(*dirs)
  aws_dir('secrets', *dirs)
end
