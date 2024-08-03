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

  I18n.backend = CDO.i18n_backend
  I18n.backend.class.send(:include, I18n::Backend::Fallbacks)
  I18n.fallbacks = I18n::Locale::Fallbacks.new(['en-US'])

  # We don't load all translations in dev and test environment.
  # Loading translations from files is slow, more than 60s sometimes. That can
  # cause unrelated eyes tests to fail because of command timeout.
  if (rack_env?(:development) || rack_env?(:test)) && !CDO.load_locales
    I18n.load_path += Dir[cache_dir('i18n/en-US.json')]
    I18n.load_path += Dir[cache_dir('i18n/es-ES.json')]
    I18n.load_path += Dir[hoc_dir('i18n/en.yml')]
    I18n.load_path += Dir[hoc_dir('i18n/es.yml')]
    I18n.load_path += Dir[hoc_dir('i18n/fr.yml')]
    I18n.load_path += Dir[hoc_dir('i18n/pt.yml')]
  else
    I18n.load_path += Dir[cache_dir('i18n/*.json')]
    I18n.load_path += Dir[hoc_dir('i18n/*.yml')]
  end
  I18n.enforce_available_locales = false
  I18n.backend.load_translations
end

load_pegasus_settings
