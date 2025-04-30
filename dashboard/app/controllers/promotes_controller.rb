require 'state_abbr'

class PromotesController < ApplicationController
  layout false, only: %i[map state]

  before_action :assign_us_state, only: %i[map state]

  # GET /promotes/map(/:us_state)
  def map
  end

  # GET /promotes/state/:us_state
  def state
    # Ensures this action is only accessible via AJAX requests
    return render_404 unless request.xhr?

    @us_state_data = DB[:cdo_state_promote].where(state_code_s: @us_state).first
    render_404 if @us_state_data.blank?
  end

  private def assign_us_state
    @us_state = params[:us_state].presence&.upcase
  end
end
