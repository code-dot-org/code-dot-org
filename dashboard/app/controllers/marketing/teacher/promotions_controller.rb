# frozen_string_literal: true

require 'contentful'

module Marketing
  module Teacher
    class PromotionsController < ApplicationController
      PROMOTIONS_CONTENTFUL_CONTENT_TYPE = 'teacher-homepage-sidebar'
      CACHE_EXPIRATION = 1.hour

      # GET /marketing/teacher/promotions/:id
      # Returns a teacher sidebar with up to two individual promotional items.
      def show
        entry = cached_contentful_promotions(params[:id])
        return head :not_found unless entry

        result = entry.fields.clone
        ads = result[:sidebar_ads].map do |ad|
          ad.fields.transform_values {|v| v.is_a?(Contentful::Asset) ? v.image_url : v}.merge(id: ad.id)
        end

        render json: ads
      rescue ArgumentError => exception
        render json: {error: exception.message}, status: :bad_request
      end

      private def cached_contentful_promotions(id)
        CDO.shared_cache.fetch("contentful-#{PROMOTIONS_CONTENTFUL_CONTENT_TYPE}:#{id}", expires_in: CACHE_EXPIRATION) do
          CdoContentful::Marketing::Entry::TeacherHomepageSidebar.find(id)
        end
      end
    end
  end
end
