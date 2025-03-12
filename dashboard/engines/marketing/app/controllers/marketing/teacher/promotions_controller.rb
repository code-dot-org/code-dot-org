# frozen_string_literal: true

require 'contentful'

module Marketing
  module Teacher
    class PromotionsController < ApplicationController
      TEACHER_HOMEPAGE_SIDEBAR_CONTENT_TYPE = 'teacherHomepageSidebar'

      # GET /marketing/teacher/promotions/:id
      # Returns a teacher sidebar with up to two individual promotional items.
      def show
        entry = Marketing::ContentfulClient.entry(request.locale, params[:id])
        return head :not_found unless entry && entry.content_type.id == TEACHER_HOMEPAGE_SIDEBAR_CONTENT_TYPE

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
end
