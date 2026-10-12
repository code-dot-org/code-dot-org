# frozen_string_literal: true

require 'securerandom'
require 'cdo/shared_constants'

module Cdo
  module AnonUserId
    FORMAT = /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/i

    def self.generate
      SecureRandom.uuid
    end

    def self.valid?(value)
      value.is_a?(String) && FORMAT.match?(value)
    end

    def self.valid_value(value)
      value if valid?(value)
    end
  end
end
