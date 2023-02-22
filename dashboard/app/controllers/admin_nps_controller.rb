require 'cdo/env'

# The controller for manipulating NPS surveys
class AdminNpsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  # PUT /admin/nps_update
  def nps_update
    audience = params[:audience]
    if ['all', 'even', 'odd', 'none'].include? audience
      DCDO.set('nps_audience', audience)
      flash[:notice] = "Survey audience updated"
    else
      flash[:alert] = "Invalid audience type"
    end
    redirect_to nps_form_path
  end
end
