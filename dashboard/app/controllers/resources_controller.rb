class ResourcesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show]

  # GET /resourcesearch
  def search
    render json: ResourcesAutocomplete.get_search_matches(params[:query], params[:limit], params[:courseVersionId])
  end

  # PUT /resources
  def create
    resource = Resource.new(
      name: resource_params.require(:name),
      url: resource_params.require(:url),
      download_url: resource_params[:downloadUrl],
      assessment: resource_params[:assessment],
      type: resource_params[:type],
      audience: resource_params[:audience],
      include_in_pdf: resource_params[:includeInPdf]
    )
    if resource_params[:courseVersionId]
      course_version = CourseVersion.find_by_id(resource_params[:courseVersionId])
      unless course_version
        render status: 400, json: {error: "course version not found"}
        return
      end
      resource.course_version = course_version if course_version
    end
    if resource.save
      render json: resource.summarize_for_lesson_edit
    else
      render status: 400, json: {error: resource.errors.full_message.to_json}
    end
  end

  # PATCH /resources/:id
  def update
    resource = Resource.find_by_id(resource_params[:id])
    if resource
      resource.update!(
        name: resource_params.require(:name),
        url: resource_params.require(:url),
        download_url: resource_params[:downloadUrl],
        assessment: resource_params[:assessment],
        type: resource_params[:type],
        audience: resource_params[:audience],
        include_in_pdf: resource_params[:includeInPdf]
      )
      render json: resource.summarize_for_lesson_edit
    else
      render json: {status: 404, error: "Resource #{resource_params[:id]} not found"}
    end
  end

  def resource_params
    rp = params.permit(:id, :name, :url, :downloadUrl, :assessment, :type, :audience, :includeInPdf, :courseVersionId)
    rp[:includeInPdf] = rp[:includeInPdf] == 'true'
    rp[:assessment] = rp[:assessment] == 'true'
    rp
  end
end
