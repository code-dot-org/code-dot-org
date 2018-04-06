module Pd
  class ApplicationDashboardController < ApplicationController
    authorize_resource class: 'Pd::Application::ApplicationBase'

    def index
      view_options(full_width: true)

      is_workshop_admin = current_user.permission? UserPermission::WORKSHOP_ADMIN
      regional_partner = current_user.regional_partners.first
      @script_data = {
        props: {
          regionalPartnerName: regional_partner.try(:name),
          regionalPartnerFilter: regional_partner.try(:id),
          regionalPartnerGroup: regional_partner.try(:group),
          regionalPartners: RegionalPartner.select("id, name"),
          isWorkshopAdmin: is_workshop_admin,
          canLockApplications: is_workshop_admin
        }.to_json
      }
    end
  end
end
