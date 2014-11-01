$:.unshift File.expand_path('../lib', __FILE__)
require 'csv'
require 'yaml'
require 'cdo/erb'
require 'cdo/slog'

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
  username = `whoami`.strip

  global_config = load_yaml_file File.join(root_dir, 'aws', 'secrets', 'config.yml')
  global_config = {'environments'=>{}, 'hosts'=>{}} unless global_config

  default_config = global_config['environments']['all'] || {}

  host_config = global_config['hosts'][hostname] || {}

  local_config = load_yaml_file(File.join(root_dir, 'locals.yml')) || {}

  env = local_config['env'] || host_config['env'] || ENV['RACK_ENV'] || ENV['RAILS_ENV'] || 'development'
  env_config = global_config['environments'][env] || {}

  rack_env = env.to_sym

  {
    'app_instances'               => [],
    'build_blockly'               => false,
    'build_blockly_core'          => false,
    'build_dashboard'             => true,
    'build_pegasus'               => true,
    'dashboard_db_name'           => "dashboard_#{rack_env}",
    'dashboard_devise_pepper'     => 'not a pepper!',
    'dashboard_facebook_key'      => 'not a real secret',
    'dashboard_port'              => 8080,
    'dashboard_twitter_key'       => '000000000000000000000',
    'dashboard_twitter_secret'    => '0000000000000000000000000000000000000000000',
    'dashboard_unicorn_name'      => 'dashboard',
    'dashboard_unicorn_pid'       => File.join(root_dir, 'aws', 'dashboard_unicorn.rb.pid'),
    'dashboard_user'              => username,
    'dashboard_workers'           => 8,
    'db_reader'                   => 'mysql://root@localhost/',
    'db_writer'                   => 'mysql://root@localhost/',
    'dns'                         => hostname,
    'freegeoip_host'              => nil,
    'hip_chat_log_room'           => rack_env.to_s,
    'hip_chat_logging'            => false,
    'home_dir'                    => File.expand_path('~'),
    'honeybadger_api_key'         =>'00000000',
    'hostname'                    => hostname,
    'languages'                   => load_languages(File.join(root_dir, 'pegasus', 'data', 'cdo-languages.csv')),
    'level_builder_port'          => 8082,
    'localize_blockly'            => true,
    'name'                        => hostname,
    'newrelic_secret'             => 'not a real secret',
    'pegasus_db_name'             => "pegasus_#{rack_env}",
    'pegasus_honeybadger_api_key' =>'00000000',
    'pegasus_port'                => 8081,
    'pegasus_unicorn_name'        => 'pegasus',
    'pegasus_unicorn_pid'         => File.join(root_dir, 'aws', 'pegasus_unicorn.rb.pid'),
    'pegasus_user'                => username,
    'pegasus_workers'             => 4,
    'poste_host'                  => 'localhost.code.org:9393',
    'poste_secret'                => 'not a real secret',
    'rack_env'                    => rack_env,
    'rack_envs'                   => [:development, :production, :staging, :test, :levelbuilder],
    'read_only'                   => false,
    'root_dir'                    => root_dir,
    'sendy_db_reader'             => 'mysql://root@localhost/',
    'sendy_db_writer'             => 'mysql://root@localhost/',
    'slog_token'                  => '00000000-0000-0000-0000-000000000000',
    'use_postfix'                 => true,
    'username'                    => username,
    'varnish_backends'            => {'localhost'=>'127.0.0.1'},
    'varnish_instances'           => [],
    'varnish_secret'              => '00000000-0000-0000-0000-000000000000',
    'varnish_storage'             => 'malloc,.5G',
  }.tap do |config|
    raise "'#{rack_env}' is not known environment." unless config['rack_envs'].include?(rack_env)
    ENV['RACK_ENV'] = rack_env.to_s unless ENV['RACK_ENV']
    raise "RACK_ENV ('#{ENV['RACK_ENV']}') does not match configuration ('#{rack_env}')" unless ENV['RACK_ENV'] == rack_env.to_s

    config.merge! default_config
    config.merge! env_config
    config.merge! host_config
    config.merge! local_config

    config['daemon']              ||= [:development, :staging, :test].include?(rack_env) || config['name'] == 'daemon'
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
    return "hoc-levels.#{domain}" if CDO.name == 'hoc-levels'
    "#{rack_env}.#{domain}"
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

def blockly_dir(*dirs)
  deploy_dir('blockly', *dirs)
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

def postfix_dir(*paths)
  aws_dir('postfix', *paths)
end

def secrets_dir(*dirs)
  aws_dir('secrets', *dirs)
end

