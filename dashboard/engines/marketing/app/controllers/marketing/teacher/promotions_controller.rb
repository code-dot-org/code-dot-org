# frozen_string_literal: true

require 'contentful'

module Marketing
  module Teacher
    class PromotionsController < ApplicationController
      # GET /marketing/teacher/promotions/:id
      # Returns a teacher sidebar with up to two individual promotional items.
      def show
        entry = CdoContentful::Marketing::Entry::TeacherHomepageSidebar.find(params[:id])
        return head :not_found unless entry

        result = entry.fields.clone
        ads = result[:sidebar_ads].map do |ad|
          ad.fields.transform_values {|v| v.is_a?(Contentful::Asset) ? v.image_url : v}.merge(id: ad.id)
        end

        render json: ads
      rescue ArgumentError => exception
        render json: {error: exception.message}, status: :bad_request
      end
    end
  end
end
