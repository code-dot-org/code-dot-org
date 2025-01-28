require 'services/marketing'

module Marketing
  module V1
    class MarketingController < ApplicationController
      # GET /marketing/v1/teacher-dashboard
      def teacher_dashboard
        return head :forbidden unless current_user&.teacher?

        client = Contentful::Client.new(
          space: '90t6bu6vlf76',
          access_token: CDO.contentful_api_key,
          api_url: 'preview.contentful.com'
        )

        entry = client.entry('43vF4jLNr5VuzOBw7dJ7nq', locale: 'en-US')
        fields = entry.fields[:items_in_this_list].map(&:fields)

        render json: fields
      rescue ArgumentError => exception
        render json: {error: exception.message}, status: :bad_request
      end
    end
  end
end
