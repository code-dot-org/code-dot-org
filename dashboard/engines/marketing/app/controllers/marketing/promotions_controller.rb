# frozen_string_literal: true

require 'contentful'
require 'marketing/contentful_client'

module Marketing
  class PromotionsController < ApplicationController
    helper Rails.application.routes.url_helpers

    TEACHER_HOMEPAGE_SIDEBAR_CONTENT_TYPE = 'teacherHomepageSidebar'

    # GET /marketing/:locale/promotions/:id
    # Returns a teacher sidebar with up to two individual promotional items.
    def show
      entry = Marketing::ContentfulClient.entry(params[:locale], params[:id])
      head :not_found unless entry.content_type.id == TEACHER_HOMEPAGE_SIDEBAR_CONTENT_TYPE

      result = entry.fields.clone
      result.transform_values! do |v|
        v.fields.transform_values do |f|
          f.is_a?(Contentful::Asset) ? f.image_url : f
        end
      end

      render json: result
    rescue ArgumentError => exception
      render json: {error: exception.message}, status: :bad_request
    end
  end
end
