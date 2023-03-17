class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    @curricula_data = CourseOffering.all.order(:display_name).map(&:serialize)
  end
end
