# frozen_string_literal: true

module CdoContentful
  module Marketing
    module Entry
      module Base
        extend ActiveSupport::Concern

        include BaseEntry

        included do
          self.client = CdoContentful::Marketing::Client
        end
      end
    end
  end
end
