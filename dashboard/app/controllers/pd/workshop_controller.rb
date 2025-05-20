module Pd
  class WorkshopController < ApplicationController
    # GET /pd/workshop/:workshop_id
    def index
      view_options(full_width: true, responsive_content: true, no_padding_container: true)
      @workshop_info = Pd::Workshop.find(params[:workshop_id])&.summarize_for_marketing_page
    end
  end
end
