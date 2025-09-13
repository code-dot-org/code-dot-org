# frozen_string_literal: true

require 'zeitwerk'

Zeitwerk::Loader.for_gem.setup

module CdoContentful
  class ConfigError < StandardError; end

  mattr_accessor :config

  def self.configure
    yield(config)
    config
  end

  self.config = ActiveSupport::OrderedOptions.new.tap do |config|
    config.cs_for_all = CdoContentful::CsForAll.config
  end

  private_class_method :config=
end
