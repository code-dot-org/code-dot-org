class ResourcesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show]

  # GET /resourcesearch/:q/:limit
  def search
    render json: ResourcesAutocomplete.get_search_matches(params[:q], params[:limit])
  end

  # PUT /resources
  def create
    resource = Resource.new(
      name: resource_params.require(:name),
      url: resource_params.require(:url),
      download_url: resource_params[:download_url],
      assessment: resource_params[:assessment],
      type: resource_params[:type],
      audience: resource_params[:audience],
      include_in_pdf: resource_params[:include_in_pdf]
    )
    if resource.save
      render json: resource.attributes
    else
      render json: {status: 400, error: resource.errors.full_message.to_json}
    end
  end

  # PATCH /resources/:id
  def update
    resource = Resource.find_by_id(resource_params[:id])
    if resource
      resource.update!(resource_params)
      render json: resource
    else
      render json: {status: 404, error: "Resource #{resource_params[:id]} not found"}
    end
  end

  def resource_params
    params.permit(:id, :name, :url, :download_url, :assessment, :type, :audience, :include_in_pdf)
  end
end
