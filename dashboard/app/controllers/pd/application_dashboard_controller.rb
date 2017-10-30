module Pd
  class ApplicationDashboardController < ApplicationController
    before_action :authenticate_user!

    def index
      view_options(full_width: true)

      @script_data = {
        props: {
          partnerName: current_user.regional_partners.first.try(:name)
        }.to_json
      }
    end
  end
end
