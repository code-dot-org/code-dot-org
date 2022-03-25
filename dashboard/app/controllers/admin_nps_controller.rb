require 'cdo/env'
require 'set'

# The controller for manipulating NPS surveys
class AdminNpsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  include SurveyResultsHelper

  # PUT /admin/nps_update
  def nps_update
    audience = params[:audience]
    if audience == "none"
      ## in survey_results_helper.rb set the NPS_SURVEY_ENABLED = false
    else
      ## in survey_results_helper.rb set the NPS_SURVEY_ENABLED = true
      if audience == "odd"
        # set audience according to odd in survey_results_helper.rb show_nps_survey?
      end
      if audience == "even"
        # set audience according to odd in survey_results_helper.rb show_nps_survey?
      end
    end
  end
end
