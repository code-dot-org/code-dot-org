module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      @permission =
        if current_user.admin?
          :admin
        elsif current_user.workshop_organizer?
          :workshop_organizer
        elsif current_user.facilitator?
          :facilitator
        else
          nil
        end

      unless @permission
        render_404
        return
      end

      view_options(full_width: true)
    end
  end
end
