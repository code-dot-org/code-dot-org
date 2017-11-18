module Pd
  class ApplicationDashboardController < ApplicationController
    authorize_resource class: 'Pd::Application::ApplicationBase'

    def index
      view_options(full_width: true)

      @script_data = {
        props: {
          regionalPartnerName: current_user.regional_partners.first.try(:name)
        }.to_json
      }
    end
  end
end
