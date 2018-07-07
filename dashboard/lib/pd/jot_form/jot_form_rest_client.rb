# Wrapper for JotForms REST API.
# JotForm (jotform.com) is a 3rd party form / survey provider we're using for certain forms.
# API docs: https://api.jotform.com/docs/
#
# Note - while JotForm does provide a Ruby API client (https://github.com/jotform/jotform-api-ruby),
# it's very minimal and doesn't support the filter param we need to query submissions.
module Pd
  module JotForm
    class JotFormRestClient
      API_ENDPOINT = 'http://api.jotform.com/'.freeze

      def initialize
        @api_key = CDO.jotform_api_key
        raise KeyError, 'Unable to find configuration entry jotform_api_key' unless @api_key

        @resource = RestClient::Resource.new(
          API_ENDPOINT,
          headers: {
            content_type: :json,
            accept: :json
          }
        )
      end

      # Get a list of all questions on a form
      # @param form_id [Integer]
      # See https://api.jotform.com/docs/#form-id-questions
      def get_questions(form_id)
        get "/form/#{form_id}/questions"
      end

      # Get a list of form submissions, optionally after a known submission id
      # @param form_id [Integer]
      # @param last_known_submission_id [Integer] (optional)
      #   when specified, only new submissions after the known id will be returned.
      # @param min_date [Date] (optional)
      #   when specified, only new submissions on or after the known date will be returned.
      #   JotForm apparently doesn't support filtering answers to specific questions.
      # @param limit [Integer] optional, default 100
      # @param offset [Integer] optional, default 0
      # Note - get_submissions has a default limit of 20, although the documentation
      #   lists the default as 100, so we specify the limit of 100 here.
      #   The API returns the limit and the count.
      # See https://api.jotform.com/docs/#form-id-submissions
      def get_submissions(form_id, last_known_submission_id: nil, min_date: nil, limit: 100, offset: 0)
        params = {
          orderby: 'id asc',
          limit: limit,
          offset: offset
        }

        filter = {}
        filter['id:gt'] = last_known_submission_id.to_s if last_known_submission_id
        filter['created_at:gt'] = min_date.to_s if min_date
        params[:filter] = filter.to_json unless filter.empty?

        get "form/#{form_id}/submissions", params
      end

      # Get a specific submission by id
      # @param submission_id [Integer]
      def get_submission(submission_id)
        get "submission/#{submission_id}"
      end

      private

      # Makes a GET call to the specified path
      # @param path [String]
      # @param params [Hash] url params
      # @return [Hash] parsed JSON response body, on success
      # @raises [RestClient::ExceptionWithResponse] on known error codes.
      # See https://github.com/rest-client/rest-client#exceptions-see-httpwwww3orgprotocolsrfc2616rfc2616-sec10html
      # Note the supplied params will be merged with default_params
      def get(path, params = {})
        path_with_params = "#{path}?#{default_params.merge(params).to_query}"
        response = @resource[path_with_params].get
        JSON.parse response.body
      end

      # We must pass the API Key on the url to authenticate.
      def default_params
        {
          apiKey: @api_key
        }
      end
    end
  end
end
