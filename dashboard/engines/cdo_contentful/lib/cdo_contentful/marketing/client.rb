# frozen_string_literal: true

module CdoContentful
  module Marketing
    class Client < BaseClient
      self.config = CdoContentful.config.marketing.client
    end
  end
end
