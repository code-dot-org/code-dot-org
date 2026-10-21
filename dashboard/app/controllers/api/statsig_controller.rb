# frozen_string_literal: true

module Api
  class StatsigController < ApplicationController
    skip_before_action :handle_cap_lockout, :assert_lms_landing_policy

    # GET /api/stable_id
    #
    # The frontend manages the stable ID cookie, because only it knows whether OneTrust consent allows it.
    # If the backend has already generated an ID, we return that one so frontend and backend events match.
    # Otherwise, we hand back a fresh ID without saving it, so this request doesn't create a Redis session.
    #
    # @see apps/src/metrics/statsigHelpers.js
    def stable_id
      render plain: request.existing_statsig_stable_id || Cdo::AnonUserId.generate
    end
  end
end
