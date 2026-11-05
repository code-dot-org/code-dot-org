# frozen_string_literal: true

module CdoContentful
  module HourOfAi
    mattr_accessor :config

    self.config = ActiveSupport::OrderedOptions.new.tap do |config|
      config.client = ActiveSupport::OrderedOptions.new.tap do |client|
        client.access_token = nil
      end
    end.freeze

    private_class_method :config=
  end
end
