require_relative '../../deployment'
require 'cdo/pegasus'
require 'i18n'
require 'i18n/backend/fallbacks'
require 'logger'
require 'bcrypt'
require 'chronic'

def slog(h)
  CDO.slog ({ application: :pegasus }).merge(h)
end

def cache_dir(*paths)
  pegasus_dir('cache', *paths)
end

def sites_dir(*paths)
  pegasus_dir('sites', *paths)
end

def sites_v3_dir(*paths)
  pegasus_dir('sites.v3', *paths)
end

def src_dir(*paths)
  pegasus_dir('src', *paths)
end

def create_pegasus_log()
  if rack_env?(:development)
    return Logger.new STDOUT
  else
    return Logger.new pegasus_dir('log', "#{rack_env}.log")
  end
end

def load_pegasus_settings()
  $log = create_pegasus_log
  $log.level = Logger::INFO if rack_env?(:production)

  I18n::Backend::Simple.send(:include, I18n::Backend::Fallbacks)
  I18n.load_path = Dir[cache_dir('i18n/*.yml')]
  I18n.enforce_available_locales = false
  I18n.backend.load_translations
end

load_pegasus_settings
