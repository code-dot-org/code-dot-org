class ReferenceGuidesController < ApplicationController
  include CurriculumHelper
  authorize_resource

  before_action :require_levelbuilder_mode_or_test_env

  def show
    if params[:course_course_name] && params[:key]
      course_version_id = find_matching_course_version(params[:course_course_name])&.id
      @reference_guide = ReferenceGuide.find_by_course_version_id_and_key(course_version_id, params[:key])
      return render :show if @reference_guide
    end
    render :not_found
  end
end
