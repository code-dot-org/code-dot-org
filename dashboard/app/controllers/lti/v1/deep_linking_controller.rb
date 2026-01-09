module Lti
  module V1
    class DeepLinkingController < ApplicationController
      before_action :authenticate_user!
      before_action :validate_deep_linking_enabled

      # GET /lti/v1/deep_linking
      def show
        @deep_linking_settings = params[:deep_linking_settings]
      end

      # POST /lti/v1/deep_linking
      def submit
        deep_linking_settings = JSON.parse(params.require(:deep_linking_settings))
        content_items = build_content_items(params[:selected_items] || [])
        jwt = Services::Lti::DeepLinkingResponseBuilder.call(
          request_issuer: session[:lti_issuer],
          client_id: session[:lti_client_id],
          deployment_id: session[:lti_deployment_id],
          deep_linking_settings:,
          content_items:,
        )

        render :form_redirect, locals: {
          deep_link_return_url: deep_linking_settings['deep_link_return_url'],
          jwt:,
        }
      end

      # Returns a static set of links to validate deep linking.
      # TODO: Update to build dynamic content items based on user selection.
      def build_content_items(selected_items)
        possible_links = [
          {
            type: 'link',
            url: 'https://studio.code.org/projects/music/new',
            title: 'Music Lab'
          },
          {
            type: 'link',
            url: 'https://studio.code.org/courses/artificial-intelligence-foundations-2025',
            title: 'AI Foundations 2025'
          }
        ]
        selected_items.map {|index| possible_links[index.to_i]}
      end

      private def validate_deep_linking_enabled
        head :not_implemented unless DCDO.get('schoology_deep_linking_enabled', false)
      end
    end
  end
end
