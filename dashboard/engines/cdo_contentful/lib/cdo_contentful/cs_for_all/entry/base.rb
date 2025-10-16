# frozen_string_literal: true

module CdoContentful
  module CsForAll
    module Entry
      module Base
        extend ActiveSupport::Concern

        include BaseEntry

        included do
          self.client = CdoContentful::CsForAll::Client
        end
      end
    end
  end
end
