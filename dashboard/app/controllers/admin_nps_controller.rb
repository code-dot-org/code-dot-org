require 'cdo/env'
require 'set'

# The controller for manipulating NPS surveys
class AdminNpsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  # PUT /admin/nps_update
  def nps_update
    audience = params[:audience]
    DCDO.set('nps_audience', audience)
  end
end
