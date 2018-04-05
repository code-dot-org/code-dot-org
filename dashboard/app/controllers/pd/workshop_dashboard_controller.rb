module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      permission_list = []

      if current_user.permission? UserPermission::WORKSHOP_ADMIN
        permission_list << 'WorkshopAdmin'
      else
        permission_list << 'Organizer' if current_user.workshop_organizer?
        permission_list << 'ProgramManager' if current_user.program_manager?
        permission_list << 'Facilitator' if current_user.facilitator?

        # CSF Facilitators have special permissions. For the time being, they are the only ones that have special permissions
        if Pd::CourseFacilitator.exists?(facilitator: current_user, course: Pd::Workshop::COURSE_CSF)
          permission_list << 'CsfFacilitator'
        end

        permission_list << 'Partner' if RegionalPartner.where(contact_id: current_user.id).exists?
      end

      if permission_list.empty?
        return render_404
      end

      @script_data = {
        props: {
          permissionList: permission_list
        }.to_json
      }

      view_options(full_width: true)
    end
  end
end
