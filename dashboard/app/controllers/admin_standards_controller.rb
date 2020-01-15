class AdminStandardsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  def import_standards
    @scripts_for_standards = Script.scripts_for_standards
  end

  def update_standards
  end
end
