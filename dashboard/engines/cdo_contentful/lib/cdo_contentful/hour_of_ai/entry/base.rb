# frozen_string_literal: true

module CdoContentful
  module HourOfAi
    module Entry
      module Base
        extend ActiveSupport::Concern

        include BaseEntry

        included do
          self.client = CdoContentful::HourOfAi::Client
        end
      end
    end
  end
end
