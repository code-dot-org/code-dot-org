module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      facilitator_courses = Pd::CourseFacilitator.where(facilitator: current_user).pluck(:course)

      permission_list = []
      regional_partners = current_user.permission?(UserPermission::WORKSHOP_ADMIN) ? RegionalPartner.all : current_user.regional_partners
      serialized_partners = regional_partners.order(:name).map do |regional_partner|
        RegionalPartnerSerializer.new(regional_partner).attributes
      end
      if current_user.permission? UserPermission::WORKSHOP_ADMIN
        permission_list << 'WorkshopAdmin'
      else
        permission_list << 'Organizer' if current_user.workshop_organizer?
        permission_list << 'ProgramManager' if current_user.program_manager?
        permission_list << 'Facilitator' if current_user.facilitator?

        # CSF Facilitators have special permissions. For the time being, they are the only ones that have special permissions
        if facilitator_courses.include? Pd::Workshop::COURSE_CSF
          permission_list << 'CsfFacilitator'
        end
      end

      if permission_list.empty?
        return render_404
      end

      @script_data = {
        props: {
          permissionList: permission_list,
          facilitatorCourses: facilitator_courses,
          regionalPartners: serialized_partners,
          mapboxAccessToken: CDO.mapbox_access_token
        }.to_json
      }

      view_options(full_width: true)
    end
  end
end
