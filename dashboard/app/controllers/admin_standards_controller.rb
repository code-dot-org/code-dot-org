class AdminStandardsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  def import_standards
  end

  def update_standards
  end
end
