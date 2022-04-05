class ReferenceGuidesController < ApplicationController
  include CurriculumHelper
  before_action :find_reference_guide, only: [:show, :update, :edit, :destroy]
  before_action :find_reference_guides, only: [:show, :edit, :edit_all]
  before_action :require_levelbuilder_mode_or_test_env, except: [:show]
  authorize_resource id_param: :key

  # GET /courses/:course_name/guides/edit
  def edit_all
    @base_url = "/courses/#{params[:course_course_name]}/guides"
  end

  # GET /courses/:course_name/guides/:key
  def show
  end

  # PATCH /courses/:course_name/guides/:key
  def update
    @reference_guide.update!(reference_guide_params.except(:key, :course_course_name))
    @reference_guide.write_serialization
    render json: @reference_guide.summarize_for_edit.to_json
  end

  # DELETE /courses/:course_name/guides/:key
  def destroy
    @reference_guide.destroy
  end

  # GET /courses/:course_name/guides/:key/edit
  def edit
    @update_url = course_reference_guide_url(params[:course_course_name], params[:key])
    @edit_all_url = edit_all_reference_guides_url(params[:course_course_name])
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

  def find_reference_guides
    course_version = find_matching_course_version(params[:course_course_name])
    authorize! :read, course_version.content_root
    unless course_version&.id
      flash[:alert] = 'No matching course version found.'
      render :not_found
    end
    @reference_guides = ReferenceGuide.where(course_version_id: course_version&.id).map(&:summarize_for_index)
  end

  def reference_guide_params
    params.permit(
      :parent_reference_guide_key,
      :display_name,
      :content,
      :position
    )
  end
end
