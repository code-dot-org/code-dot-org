module Pd
  class ApplicationDashboardController < ApplicationController
    authorize_resource class: 'Pd::Application::ApplicationBase'

    def index
      view_options(full_width: true)

      is_workshop_admin = current_user.permission? UserPermission::WORKSHOP_ADMIN
      regional_partners = is_workshop_admin ? RegionalPartner.all : current_user.regional_partners
      serialized_partners = regional_partners.map do |regional_partner|
        RegionalPartnerSerializer.new(regional_partner).attributes
      end

      @unit_data = {
        props: {
          regionalPartners: serialized_partners,
          isWorkshopAdmin: is_workshop_admin,
          canLockApplications: is_workshop_admin
        }.to_json
      }
    end
  end
end
