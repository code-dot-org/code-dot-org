class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)
    @curricula_data = CourseOffering.all.order(:display_name).map(&:serialize)
  end
end
