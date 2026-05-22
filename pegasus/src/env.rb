require_relative '../../deployment'
require 'cdo/pegasus'
require 'i18n'
require 'i18n/backend/fallbacks'
require 'cdo/i18n_backend'
require 'logger'
require 'bcrypt'
require 'chronic'
require 'nokogiri'

def cache_dir(*paths)
  pegasus_dir('cache', *paths)
end

def sites_dir(*paths)
  pegasus_dir('sites', *paths)
end

def sites_v3_dir(*paths)
  pegasus_dir('sites.v3', *paths)
end

def hoc_dir(*paths)
  pegasus_dir('sites.v3', 'hourofcode.com', *paths)
end

def src_dir(*paths)
  pegasus_dir('src', *paths)
end

module Pegasus
  def self.logger
    @@logger ||= create_logger
  end

  def self.create_logger
    logger = Logger.new $stdout if rack_env?(:development)
    logger ||= Logger.new pegasus_dir('log', "#{rack_env}.log")

    logger.level = Logger::INFO if rack_env?(:production)

    logger
  end
end

def load_pegasus_settings
  $log = Pegasus.logger
end

load_pegasus_settings
