module Pd
  class WorkshopsController < ApplicationController
    # There are 2 workshops_controllers. This controller handles the workshop marketing page (i.e.
    # navigating to studio.code.org/pd/workshops/:workshop_id), while the other controller
    # (/controllers/api/v1/pd/workshops_controller.rb) handles everything else (creating, updating,
    # destroying, etc.).

    # GET /pd/workshops/:workshop_id
    def index
      view_options(full_width: true, responsive_content: true, no_padding_container: true)
      @workshop_info = Pd::Workshop.find(params[:workshop_id])&.summarize_for_marketing_page
    end
  end
end
