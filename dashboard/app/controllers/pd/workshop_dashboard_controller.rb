module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      @permission = nil

      if current_user.admin?
        @permission = :admin
      elsif current_user.workshop_organizer? || current_user.facilitator?
        @permission = []
        @permission << :workshop_organizer if current_user.workshop_organizer?
        @permission << :facilitator if current_user.facilitator?
      end

      unless @permission
        render_404
        return
      end

      view_options(full_width: true)
    end
  end
end
