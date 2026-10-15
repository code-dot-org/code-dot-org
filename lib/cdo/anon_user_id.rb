# frozen_string_literal: true

require 'securerandom'
require 'cdo/shared_constants'

module Cdo
  module AnonUserId
    KEY = SharedConstants::STATSIG_STABLE_ID_KEY
    FORMAT = /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/i

    def self.generate
      SecureRandom.uuid
    end

    def self.valid?(value)
      value.is_a?(String) && FORMAT.match?(value)
    end

    def self.clear(request)
      request.cookies.delete(KEY)
      request.cookie_jar.delete(KEY, domain: :all)
      request.session.delete(KEY)
    end
  end
end
