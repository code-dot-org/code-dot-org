module Lti
  module V1
    class DeepLinkingController < ApplicationController
      before_action :authenticate_user!
      before_action :validate_deep_linking_enabled

      # GET /lti/v1/deep_linking
      def index
        @deep_linking_settings = params[:deep_linking_settings]
      end

      private def validate_deep_linking_enabled
        unless DCDO.get('schoology_deep_linking_enabled', false)
          head :not_implemented and return
        end
      end
    end
  end
end
