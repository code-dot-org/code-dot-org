# frozen_string_literal: true

require 'contentful'

module Marketing
  module Teacher
    class PromotionsController < ApplicationController
      TEACHER_HOMEPAGE_SIDEBAR_CONTENT_TYPE = 'teacherHomepageSidebar'

      # GET /marketing/teacher/promotions/:id
      # Returns a teacher sidebar with up to two individual promotional items.
      def show
        entry = Marketing::ContentfulClient.entry('en-US', params[:id])
        return head :not_found unless entry && entry.content_type.id == TEACHER_HOMEPAGE_SIDEBAR_CONTENT_TYPE

        hidden_promotions = HiddenPromotion.where(teacher: current_user).pluck(:promotion_id)

        result = entry.fields.clone
        ads = result[:sidebar_ads].
            reject {|ad| hidden_promotions.include?(ad.id)}.
            map do |ad|
          ad.fields.transform_values {|v| v.is_a?(Contentful::Asset) ? v.image_url : v}.merge(id: ad.id)
        end

        render json: ads
      rescue ArgumentError => exception
        render json: {error: exception.message}, status: :bad_request
      end

      # POST /marketing/teacher/promotions/hide/:promotion_id
      # Hides a promotion for the current teacher.
      def hide
        return head :forbidden unless current_user&.teacher?

        promotion_id = params[:promotion_id]
        return head :bad_request unless promotion_id

        HiddenPromotion.find_or_create_by(teacher: current_user, promotion_id: promotion_id)
        head :ok
      end
    end
  end
end
