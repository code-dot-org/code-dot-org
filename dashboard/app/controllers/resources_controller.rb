class ResourcesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show]

  # GET /resourcesearch/:q/:limit
  def search
    render json: ResourcesAutocomplete.get_search_matches(params[:q], params[:limit])
  end

  def create
    resource = Resource.new(
      key: resource_params.require(:key),
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
    if resource.save
      render json: resource.attributes
    else
      render json: {status: 400, error: resource.errors.full_message.to_json}
    end
  end

  def resource_params
    params.permit(:key, :name, :url, :downloadUrl, :assessment, :type, :audence, :include_in_pdf)
  end
end
