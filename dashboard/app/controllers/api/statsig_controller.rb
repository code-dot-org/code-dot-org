# frozen_string_literal: true

module Api
  class StatsigController < ApplicationController
    skip_before_action :handle_cap_lockout, :assert_lms_landing_policy
    # GET /api/stable_id
    def stable_id
      render plain: request.statsig_stable_id
    end
  end
end
