# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  module SessionManageable
    extend ActiveSupport::Concern

    SESSION_ROW_CREATION_RETRIES = 3
    DEFAULT_HOC_ACTIVITY_WEIGHT = 1

    included do
      private def request
        raise NoMethodError, 'request must be defined in the including class'
      end

      private def response
        raise NoMethodError, 'response must be defined in the including class'
      end
    end

    private def unsampled_session?
      request.cookies[HOC_COOKIE_KEY] == UNSAMPLED_SESSION_ID
    end

    private def set_hour_of_code_cookie_for_row(row)
      response.set_cookie(
        HOC_COOKIE_KEY,
        {
          value: row[:session],
          domain: HOC_COOKIES_DOMAIN,
          path: File.join(request.script_name, HOC_COOKIES_PATH),
        }
      )
    end

    # Returns the session id for the current session if sampled, or nil if unset or unsampled.
    private def session_id
      unsampled_session? ? nil : request.cookies[HOC_COOKIE_KEY]
    end

    # Creates a session row with the given weight and sets the hour of code cookie to contain the session id.
    private def create_session_row(row, weight: nil)
      weight ||= DEFAULT_SESSION_WEIGHT
      retries = SESSION_ROW_CREATION_RETRIES

      loop do
        # Create a session id that also encodes the weight of the session.
        # We should actually use a separate column for the weight, but need to defer adding
        # that column until after the hour of code. (hoc_activity currently has ~100M rows).
        row[:session] = "_#{weight}_#{SecureRandom.hex}"

        row[:id] = PEGASUS_DB[:hoc_activity].insert(row)
        break unless row[:id] == 0 && (retries -= 1) > 0
      end

      raise "Couldn't create a unique session row." if row[:id] == 0

      set_hour_of_code_cookie_for_row(row)

      row
    end

    # Creates a session row and sets the hour of code cookie to the session_id,
    # if the user is assigned to the sample set (as decided by a random choice
    # based on the reciprocal of the hoc_activity_sample_weight DCDO variable).
    #
    # If, however, the user is not in the sample, returns nil and sets the cookie
    # to UNSAMPLED_SESSION_ID.
    #
    # The "weight" encoded in the session row is set to hoc_activity_sample_weight
    # and the probability that a given sample will be in the session is
    # 1 / weight, so that reports can compute the approximate number of actual sessions
    # by summing over the weights. A weight of 0 is defined to mean nothing should be
    # sampled, as is a negative weight.
    private def create_session_row_unless_unsampled(**row_params)
      # We don't need to do anything if we've already decided this session is unsampled.
      return if unsampled_session?

      # Decide whether the session should be sampled. Don't sample for cartoon network
      # (or any company). We always need to create a session row in order to show the
      # correct call to action on the congrats page.
      weight = row_params[:company].nil? ? DCDO.get('hoc_activity_sample_weight', 1).to_i : DEFAULT_HOC_ACTIVITY_WEIGHT

      # DANGER - as of 12/2017 we believe this doesn't behave as expected. Setting
      # weight to 10 should yield 10% saved rows. In practice, it appears to yield
      # between 5 - 6% saved rows. We don't presently understand what the bug is.
      # (Possibly the cookie is leading to overfiltering?) We should understand/fix
      # this before setting weight to anything besides 1 in the future.
      if weight > 0 && Kernel.rand < (1.0 / weight)
        # If we decided to make the session sampled, create the session row and set the hoc cookie.
        row = create_session_row(row_params, weight: weight)
      else
        # Otherwise set the hoc cookie to make the session as unsampled.
        set_hour_of_code_cookie_for_row(session: UNSAMPLED_SESSION_ID)
        row = nil
      end

      row
    end

    private def session_row_query
      PEGASUS_DB[:hoc_activity].where(session: session_id)
    end
  end
end
