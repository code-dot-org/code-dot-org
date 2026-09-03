# frozen_string_literal: true

require 'securerandom'

module AnonUserId
  # UUID V4 format
  FORMAT = /\A[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

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
