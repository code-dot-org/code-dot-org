class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    @curricula_data = CourseOffering.all.order(:key).map(&:serialize)
  end
end
