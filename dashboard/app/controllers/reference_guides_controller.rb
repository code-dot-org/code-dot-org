class ReferenceGuidesController < ApplicationController
  include CurriculumHelper
  before_action :find_reference_guide, only: [:show]
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:show]

  def show
    render :not_found if !params[:course_course_name] || !params[:key]
  end

  private

  def find_reference_guide
    course_version_id = find_matching_course_version(params[:course_course_name])&.id
    unless course_version_id
      flash[:alert] = 'No matching course version found.'
      render :not_found
    end
    @reference_guide = ReferenceGuide.find_by_course_version_id_and_key(course_version_id, params[:key])
    unless @reference_guide
      flash[:alert] = 'No matching reference guide found.'
      render :not_found
    end
  end
end
