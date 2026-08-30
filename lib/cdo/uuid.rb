# frozen_string_literal: true

require 'securerandom'

# Utilities for generating and validating UUID v4 strings.
module Cdo
  module UUID
    V4_FORMAT = /\A[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

    # Generates a random UUID v4.
    #
    # @return [String] a UUID v4 string
    def self.generate
      SecureRandom.uuid
    end

    # Checks whether a value is a valid UUID v4 string.
    #
    # @param value [Object] the value to validate
    # @return [Boolean] `true` if the value is a valid UUID v4 string, otherwise `false`
    def self.valid?(value)
      value.is_a?(String) && V4_FORMAT.match?(value)
    end

    # Returns the UUID v4 string if it is valid.
    #
    # @param value [Object] the value to validate
    # @return [String, nil] the original UUID v4 string if valid, otherwise `nil`
    def self.valid_value(value)
      value if valid?(value)
    end
  end
end
