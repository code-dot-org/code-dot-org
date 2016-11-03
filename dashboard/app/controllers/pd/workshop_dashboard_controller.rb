module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      @permission = nil

      if current_user.admin?
        @permission = :admin
      elsif current_user.workshop_organizer?
        @permission = current_user.facilitator? ? [:workshop_organizer, :facilitator] : [:workshop_organizer]
      elsif current_user.facilitator?
        @permission = [:facilitator]
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
