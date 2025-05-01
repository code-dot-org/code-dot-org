require 'cdo/db'
require 'state_abbr'

class PromotesController < ApplicationController
  layout false, only: %i[map state]

  before_action :allow_embedding, only: %i[map]
  before_action :assign_us_state, only: %i[map state]

  # GET /promote/map(/:us_state)
  def map
    # rubocop:disable CustomCops/PegasusDbUsage
    @hs_access_count = PEGASUS_DB[:cdo_state_promote].where(require_hs_s: 'Yes').count
    @k12_access_count = PEGASUS_DB[:cdo_state_promote].where(require_k12_s: 'Yes').count
    @jobs_nationwide = PEGASUS_DB[:cdo_state_promote].sum(:cs_jobs_i)
    @grads_nationwide = PEGASUS_DB[:cdo_state_promote].sum(:cs_graduates_i)
    # rubocop:enable CustomCops/PegasusDbUsage
  end

  # GET /promote/state/:us_state
  def state
    # Ensures this action is only accessible via AJAX requests
    return render_404 unless request.xhr?

    # rubocop:disable CustomCops/PegasusDbUsage
    @us_state_data = PEGASUS_DB[:cdo_state_promote].where(state_code_s: @us_state).first
    # rubocop:enable CustomCops/PegasusDbUsage
    render_404 if @us_state_data.blank?
  end

  private def assign_us_state
    @us_state = params[:us_state].presence&.upcase
  end
end
