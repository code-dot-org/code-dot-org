class AdminStandardsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  def import_standards
  end

  def update_standards
    JSON.parse params[:cb_standards_data]
  end
end
