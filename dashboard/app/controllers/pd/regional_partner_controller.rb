class Pd::RegionalPartnerController < ApplicationController
  authorize_resource class: :pd_regional_partner_management

  # GET /pd/regional_partner/search
  def search
  end
end
