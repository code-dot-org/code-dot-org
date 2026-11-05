# frozen_string_literal: true

module CdoContentful
  module HourOfAi
    class Client < BaseClient
      self.config = CdoContentful.config.hour_of_ai.client
    end
  end
end
