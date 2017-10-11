module Pd
  class ApplicationDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      @permission = nil

      if current_user.permission? UserPermission::WORKSHOP_ADMIN
        @permission = :workshop_admin
      end

      unless @permission
        render_404
        return
      end

      view_options(full_width: true)
    end
  end
end
