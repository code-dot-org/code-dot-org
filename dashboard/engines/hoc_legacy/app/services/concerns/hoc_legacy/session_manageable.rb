# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  module SessionManageable
    extend ActiveSupport::Concern

    DEFAULT_SESSION_WEIGHT = 1
    SESSION_ROW_CREATION_RETRIES = 3

    included do
      private def request
        raise NoMethodError, 'request must be defined in the including class'
      end

      private def response
        raise NoMethodError, 'response must be defined in the including class'
      end
    end

    private def set_hour_of_code_cookie_for_row(row)
      response.set_cookie(
        HOC_COOKIE_KEY,
        {
          value: row[:session],
          domain: HOC_COOKIE_DOMAIN,
          path: File.join(request.script_name, API_ROOT_PATH),
        }
      )
    end

    # Creates a session row with the given weight and sets the hour of code cookie to contain the session id.
    private def create_session_row(row, weight: DEFAULT_SESSION_WEIGHT)
      retries = SESSION_ROW_CREATION_RETRIES

      loop do
        # Create a session id that also encodes the weight of the session.
        # We should actually use a separate column for the weight, but need to defer adding
        # that column until after the hour of code. (hoc_activity currently has ~100M rows).
        row[:session] = "_#{weight.to_i}_#{SecureRandom.hex}"

        row[:id] = PEGASUS_DB[:hoc_activity].insert(row)
        break unless row[:id] == 0 && (retries -= 1) > 0
      end

      raise "Couldn't create a unique session row." if row[:id] == 0

      set_hour_of_code_cookie_for_row(row)

      row
    end

    # Returns the session id for the current session if sampled, or nil if unset or unsampled.
    private def cookie_session_id
      request.cookies[HOC_COOKIE_KEY]
    end

    private def session_row_query
      PEGASUS_DB[:hoc_activity].where(session: cookie_session_id)
    end
  end
end
