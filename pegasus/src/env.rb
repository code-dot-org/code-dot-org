require_relative '../../deployment'
require 'cdo/pegasus'
require 'i18n'
require 'i18n/backend/fallbacks'
require 'logger'
require 'bcrypt'
require 'chronic'
require 'nokogiri'

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

module Pegasus
  def self.logger
    @@logger ||= create_logger
  end

  def self.create_logger
    logger = Logger.new STDOUT if rack_env?(:development)
    logger ||= Logger.new pegasus_dir('log', "#{rack_env}.log")

    logger.level = Logger::INFO if rack_env?(:production)

    logger
  end
end

def load_pegasus_settings
  $log = Pegasus.logger

  I18n::Backend::Simple.send(:include, I18n::Backend::Fallbacks)
  I18n.load_path += Dir[cache_dir("i18n/#{rack_env?(:development) ? 'en*' : '*'}.yml")]
  I18n.enforce_available_locales = false
  I18n.backend.load_translations
end

load_pegasus_settings
