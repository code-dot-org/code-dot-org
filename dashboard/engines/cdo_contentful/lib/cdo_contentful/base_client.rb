# frozen_string_literal: true

require 'contentful'
require 'singleton'

module CdoContentful
  class BaseClient
    include Singleton

    attr_reader :contentful_client

    class << self
      attr_accessor :config

      def method_missing(method, *args, &block)
        return super unless instance.contentful_client.respond_to?(method)
        instance.contentful_client.public_send(method, *args, &block)
      end

      def respond_to_missing?(method, include_private = false)
        instance.contentful_client.respond_to?(method, include_private) || super
      end
    end

    def initialize
      raise ConfigError, "Missing #{self.class.name} configuration" if self.class.config.blank?

      @contentful_client = Contentful::Client.new(self.class.config)
    end
  end
end
