# frozen_string_literal: true

module CdoContentful
  module CsForAll
    class Client < BaseClient
      self.config = CdoContentful.config.cs_for_all.client&.deep_symbolize_keys!
    end
  end
end
