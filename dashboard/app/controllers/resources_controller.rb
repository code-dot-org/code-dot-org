class ResourcesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show]

  # GET /resourcesearch
  def search
    render json: ResourcesAutocomplete.get_search_matches(params[:query], params[:limit], params[:courseVersionId])
  end

  def create
    resource = Resource.new(
      name: resource_params.require(:name),
      url: resource_params.require(:url),
      properties: {
        download_url: resource_params[:downloadUrl],
        assessment: resource_params[:assessment],
        type: resource_params[:type],
        audience: resource_params[:audience],
        include_in_pdf: resource_params[:include_in_pdf]
      }
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
      render json: resource.attributes
    else
      render status: 400, json: {error: resource.errors.full_message.to_json}
    end
  end

  def resource_params
    params.permit(:name, :url, :downloadUrl, :assessment, :type, :audience, :include_in_pdf, :courseVersionId)
  end
end
