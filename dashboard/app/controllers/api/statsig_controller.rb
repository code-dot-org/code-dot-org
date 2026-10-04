# frozen_string_literal: true

module Api
  class StatsigController < ApplicationController
    # GET /api/statsig/stable_id
    def stable_id
      render plain: request.statsig_stable_id
    end
  end
end
