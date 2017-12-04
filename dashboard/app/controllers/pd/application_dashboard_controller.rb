module Pd
  class ApplicationDashboardController < ApplicationController
    authorize_resource class: 'Pd::Application::ApplicationBase'

    def index
      view_options(full_width: true)

      is_workshop_admin = current_user.permission? UserPermission::WORKSHOP_ADMIN
      @script_data = {
        props: {
          regionalPartnerName: current_user.regional_partners.first.try(:name),
          regionalPartners: RegionalPartner.select("id, name"),
          isWorkshopAdmin: is_workshop_admin,
          canLockApplications: can?(:manage, Pd::Application::ApplicationBase)
        }.to_json
      }
    end
  end
end
