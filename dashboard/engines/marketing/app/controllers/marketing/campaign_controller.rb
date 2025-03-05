require 'contentful'

module Marketing
  class CampaignController < ApplicationController
    helper Rails.application.routes.url_helpers

    # GET /marketing/:locale/campaign/:id
    def show
      render json: Services::Marketing::ContentfulClient.instance.entry(params[:locale], params[:id])
    rescue ArgumentError => exception
      render json: {error: exception.message}, status: :bad_request
    end
  end
end
