module Pd
  class ApplicationDashboardController < ApplicationController
    include Application::RegionalPartnerTeacherconMapping

    authorize_resource class: 'Pd::Application::ApplicationBase'

    def index
      view_options(full_width: true)

      is_workshop_admin = current_user.permission? UserPermission::WORKSHOP_ADMIN
      regional_partners = is_workshop_admin ? RegionalPartner.all : current_user.regional_partners
      regional_partners = regional_partners.select(:id, :name, :group).map do |partner|
        processed_partner = partner.attributes
        processed_partner["teachercon?"] = get_matching_teachercon(partner)
        processed_partner
      end

      @script_data = {
        props: {
          regionalPartners: regional_partners,
          isWorkshopAdmin: is_workshop_admin,
          canLockApplications: is_workshop_admin
        }.to_json
      }
    end
  end
end
