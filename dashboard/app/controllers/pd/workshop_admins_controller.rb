class Pd::WorkshopAdminsController < ApplicationController
  authorize_resource class: :pd_workshop_user_management

  # get /pd/workshop_admins
  def directory
  end
end
