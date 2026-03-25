class ResourcesController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show]

  # GET /resources/search
  def search
    course_version_id = if params[:forJitPl]
      JitPlConcept.jit_pl_course_version.id
    else
      params[:courseVersionId]
    end
    render json: ResourcesAutocomplete.get_search_matches(params[:query], params[:limit], course_version_id)
  end

  # PUT /resources
  def create
    new_resource_params = resource_params
    resource = Resource.new(
      name: new_resource_params.require(:name),
      url: new_resource_params.require(:url),
      download_url: new_resource_params[:download_url],
      assessment: new_resource_params[:assessment],
      type: new_resource_params[:type],
      audience: new_resource_params[:audience],
      embeddability_type: new_resource_params[:embeddability_type],
      curriculum_category: new_resource_params[:curriculum_category],
      include_in_pdf: new_resource_params[:include_in_pdf]
    )
    if params[:forJitPl]
      course_version = JitPlConcept.jit_pl_course_version
      unless course_version
        render status: :bad_request, json: {error: "JIT PL course version not found"}
        return
      end
      resource.course_version = course_version
    elsif new_resource_params[:course_version_id]
      course_version = CourseVersion.find_by_id(new_resource_params[:course_version_id])
      unless course_version
        render status: :bad_request, json: {error: "course version not found"}
        return
      end
      resource.course_version = course_version
    end
    if resource.save
      resource.serialize_scripts
      render json: resource.summarize_for_lesson_edit
    else
      render status: :bad_request, json: {error: resource.errors.full_message.to_json}
    end
  end

  # PATCH /resources/:id
  def update
    resource = Resource.find_by_id(resource_params[:id])
    if resource
      resource.update!(resource_params)
      resource.serialize_scripts
      render json: resource.summarize_for_lesson_edit
    else
      render json: {status: 404, error: "Resource #{resource_params[:id]} not found"}
    end
  end

  private def resource_params
    rp = params.transform_keys(&:underscore)
    rp = rp.permit(:id, :name, :url, :download_url, :assessment, :type, :audience, :embeddability_type, :curriculum_category, :include_in_pdf, :course_version_id)
    rp[:include_in_pdf] = rp[:include_in_pdf] == 'true'
    rp[:assessment] = rp[:assessment] == 'true'
    rp
  end
end
