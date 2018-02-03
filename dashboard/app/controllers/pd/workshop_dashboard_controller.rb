module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      @permission = nil

      if current_user.permission? UserPermission::WORKSHOP_ADMIN
        @permission = :workshop_admin
      else
        permission_list = []
        permission_list << :workshop_organizer if current_user.workshop_organizer?
        permission_list << :facilitator if current_user.facilitator?
        permission_list << :partner if RegionalPartner.where(contact_id: current_user.id).exists?
        @permission = permission_list unless permission_list.empty?
      end

      unless @permission
        render_404
        return
      end

      view_options(full_width: true)
    end
  end
end
