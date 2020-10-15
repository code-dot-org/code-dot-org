class ResourcesController < ApplicationController
  before_action :require_levelbuilder_mode, except: [:index, :show]

  # GET /resourcesearch/:q/:limit
  def search
    render json: ResourcesAutocomplete.get_search_matches(params[:q], params[:limit])
  end

  def create
    resource = Resource.new(
      key: params.require(:key),
      name: params.require(:name),
      url: params.require(:url),
      properties: {
        download_url: params[:downloadUrl],
        assessment: params[:assessment],
        type: params[:type],
        audience: params[:audience],
        include_in_pdf: params[:include_in_pdf]
      }
    )
    if resource.save!
      render json: resource.attributes
    else
      render json: {status: 500, error: resource.errors.full_message.to_json}
    end
  end

  def resource_params
    params.permit(:key, :name, :url, :downloadUrl, :assessment, :type, :audence, :include_in_pdf)
  end
end
