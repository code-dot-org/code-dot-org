require File.expand_path('../../deployment', __FILE__)

require 'active_support'
require 'active_support/all'

require 'cdo/sinatra'
require 'cdo/net/http'

require 'omniauth'
require 'omniauth-google-oauth2'

require 'sequel'

#
# JupiterApp
#
# Jupiter is the supreme god of the Roman pantheon and protector of the state and its laws.
#
class JupiterApp < Sinatra::Base
  
  #
  # create_database
  #
  def self.create_database(logger)
    writer = CDO.jupiter_database.gsub('mysql:', 'mysql2:')
    
    if CDO.jupiter_database_reader
      reader = CDO.jupiter_database_reader.gsub 'mysql:', 'mysql2:' 
      reader_uri = URI(reader)
      db = Sequel.connect(writer, servers:{read_only:{host:reader_uri.host}})
    else
      db = Sequel.connect(writer)
    end

    if CDO.jupiter_database_logging
      logger.info "Database `#{writer}` opened."
      logger.info "Database `#{reader}` read-follower attached." if CDO.jupiter_database_reader
      db.loggers << logger
    end

    db.extension :server_block

    db
  end
  
  #
  # create_logger
  #
  def self.create_logger()
    loggers = []
  
    unless rack_env?(:development)
      log_path = jupiter_dir('log', "#{rack_env}.log")
      loggers << ActiveSupport::Logger.new(log_path)
    end
  
    if rack_env?(:development)
      loggers << ActiveSupport::Logger.new(STDOUT)
    end
    
    primary_logger = loggers.shift #|| ActiveSupport::Logger.new(nil)
    loggers.each do |next_logger|
      primary_logger.extend(ActiveSupport::Logger.broadcast(next_logger))
    end
    
    primary_logger.info "Log opened at #{DateTime.now}"
  
    primary_logger
  end

  use Rack::Session::Cookie, key:"jupiter.#{rack_env}", secret:CDO.jupiter_session_secret

  use OmniAuth::Builder do
    provider :google_oauth2, CDO.dashboard_google_key, CDO.dashboard_google_secret
  end
  
  configure do
    logger = create_logger
    database = create_database(logger)
    
    set :database, database
    set :logger, logger
    set :root, jupiter_dir
    set :static, true

    # Normally :development mode causes OmniAuth errors to raise exceptions to support debugging
    # problems getting a provider working. If, instead, you want to test our error handling code,
    # uncomment the next line:
    #OmniAuth.config.failure_raise_out_environments = []
  end

  before do
    require_authentication
    
    @title = 'Jupiter'
    
    @header = :layout_header
    @notice = nil
    @footer = :layout_footer

    @scripts = [
      '/js/jquery.min.js',
      '/js/jupiter.js',
    ]

    @stylesheets = [
      'http://yui.yahooapis.com/3.18.1/build/cssreset/cssreset-min.css',
      'http://yui.yahooapis.com/3.18.1/build/cssbase/cssbase-min.css',
      '/css/style.css',
    ]
  end
  
  after do
  end
  
  get '/health_check' do
    halt 200, "Healthy\n"
  end

  get '/' do
    haml :home
  end
  
  get '/signin' do
    redirect('/auth/google_oauth2', :found)
  end

  get '/signout' do
    session.delete('user.email')
    redirect('https://accounts.google.com/logout', :found)
  end
  
  get '/disintegrate/pivotaltracker' do
    database[:users].where(email:user['email']).update(pivotal_token:nil)
    redirect '/settings'
  end
  
  get '/integrate/pivotaltracker' do
    auth = Rack::Auth::Basic::Request.new(request.env)
    unless auth.provided? and auth.basic? and auth.credentials and auth.credentials
      headers['WWW-Authenticate'] = 'Basic realm="Pivotal Tracker"'
      halt 401, "Not authorized\n"
    end

    response = Net::HTTP::get_with_basic_auth('https://www.pivotaltracker.com/services/v5/me', *auth.credentials)
    halt(response.code, "Pivotal Response #{response.code}\n") unless response.code == '200'
    
    me = JSON.parse(response.body)
    
    database[:users].where(email:user['email']).update(pivotal_token:me['api_token'])

    redirect '/settings'
  end

  get '/settings' do
    haml :settings
  end
  
  get '/users' do
    haml :users
  end

  get '/users/:email' do |email|
    haml :user, locals:{email:email}
  end
  
  get '/auth/denied' do
    redirect '/signin' unless user
    haml :authentication_denied
  end
  
  get '/auth/failure' do
    haml :authentication_failed
  end
  
  get_or_post '/auth/google_oauth2/callback' do
    authentication_callback(redirect_uri:'/')
  end
  
  helpers do
    def cache_dir(*dirs)
      jupiter_dir('cache', *dirs)
    end
    
    def database()
      settings.database
    end
    
    def logger()
      settings.logger
    end
    
    Dir.glob(File.join(settings.root, 'helpers', '*.rb')).sort.each do |path|
      load(path)
    end
  end

end
