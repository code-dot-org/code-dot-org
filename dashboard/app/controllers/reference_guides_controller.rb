class ReferenceGuidesController < ApplicationController
  include CurriculumHelper
  before_action :redirect_unit_group, only: [:show, :index]
  before_action :find_reference_guide, only: [:show, :update, :edit, :destroy]
  before_action :find_reference_guides, only: [:show, :edit, :edit_all]
  before_action :require_levelbuilder_mode_or_test_env, except: [:show, :index]
  authorize_resource id_param: :key

  # GET /courses/:course_name/guides/edit
  def edit_all
    @base_url = "/courses/#{params[:course_course_name]}/guides"
  end

  # GET /courses/:course_name/guides/:key
  def show
    @base_url = "/courses/#{params[:course_course_name]}/guides"
  end

  # GET /courses/:course_name/guides
  def index
    # redirect to the show page for the first guide within a category
    course_version_id = CurriculumHelper.find_matching_course_version(params[:course_course_name])&.id
    first_category_key = ReferenceGuide.where(course_version_id: course_version_id, parent_reference_guide_key: nil).
                         order('position').first&.key
    first_child_key = ReferenceGuide.where(course_version_id: course_version_id, parent_reference_guide_key: first_category_key).
                      order('position').first&.key
    redirect_to course_reference_guide_path(params[:course_course_name], first_child_key)
  end

  # GET /courses/:course_name/guides/new
  def new
    @base_url = course_reference_guides_path(params[:course_course_name])
  end

  # POST /courses/:course_name/guides
  def create
    course_version_id = CurriculumHelper.find_matching_course_version(params[:course_course_name])&.id
    reference_guide = ReferenceGuide.new(
      key: params[:key],
      display_name: params[:key],
      course_version_id: course_version_id,
      position: after_last_child_position(course_version_id, nil)
    )
    if reference_guide.save
      reference_guide.write_serialization
      redirect_to edit_course_reference_guide_path(params[:course_course_name], reference_guide.key)
    else
      render :not_acceptable, json: reference_guide.errors
    end
  end

  # PATCH /courses/:course_name/guides/:key
  def update
    new_attributes = reference_guide_params.except(:key, :course_course_name)
    # when updating the parent, move the reference guide to the end of that list of children
    # so that it receives a unique position among its siblings
    if @reference_guide.parent_reference_guide_key != new_attributes[:parent_reference_guide_key] && !new_attributes[:position]
      new_attributes[:position] = after_last_child_position(@reference_guide.course_version_id, new_attributes[:parent_reference_guide_key])
    end
    @reference_guide.update!(new_attributes)
    @reference_guide.write_serialization
    render json: @reference_guide.summarize_for_edit.to_json
  end

  # DELETE /courses/:course_name/guides/:key
  def destroy
    @reference_guide.remove_serialization
    @reference_guide.destroy
  end

  # GET /courses/:course_name/guides/:key/edit
  def edit
    @update_url = course_reference_guide_url(params[:course_course_name], params[:key])
    @edit_all_url = edit_all_reference_guides_url(params[:course_course_name])
  end

  private def after_last_child_position(course_version_id, parent_key)
    (ReferenceGuide.
      where(course_version_id: course_version_id, parent_reference_guide_key: parent_key).
      order('position').
      last&.position || 0) + 1
  end

  private def redirect_unit_group
    course_name = params[:course_course_name]

    # When the url of a course family is requested, redirect to a specific course version.
    if UnitGroup.family_names.include?(course_name)
      unit_group = UnitGroup.latest_stable_version(course_name)
      redirect_to action: params[:action], course_course_name: unit_group.name, key: params[:key] if unit_group
    end
  end

  private def find_reference_guide
    course_version_id = CurriculumHelper.find_matching_course_version(params[:course_course_name])&.id
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

  private def find_reference_guides
    course_version = CurriculumHelper.find_matching_course_version(params[:course_course_name])
    authorize! :read, course_version.content_root
    unless course_version&.id
      flash[:alert] = 'No matching course version found.'
      render :not_found
    end
    @reference_guides = ReferenceGuide.where(course_version_id: course_version&.id).map(&:summarize_for_index)
  end

  private def reference_guide_params
    params.permit(
      :parent_reference_guide_key,
      :display_name,
      :content,
      :position
    )
  end
end
