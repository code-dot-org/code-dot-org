class Pd::WorkshopAdminsController < ApplicationController
  authorize_resource class: :pd_workshop_admins

  # get /pd/workshop_admins
  def directory
  end
end
