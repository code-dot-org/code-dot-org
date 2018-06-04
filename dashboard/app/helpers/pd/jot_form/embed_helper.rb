module Pd
  module JotForm
    module EmbedHelper
      BASE_URL = 'https://form.jotform.com/jsform/'.freeze

      # Generates a script tag that will render a JotForm form in place
      # @param form_id [Integer]
      # @param params [Hash] parameters to pass to the form, shaped {question_name => initial value}
      def embed_jotform(form_id, params)
        url = "#{BASE_URL}#{form_id}?#{format_url_params(params)}"
        javascript_include_tag url, extname: false
      end

      def format_url_params(hash)
        hash.map do |key, value|
          [
            key.to_s,
            sanitize_value(value)
          ]
        end.to_h.to_param
      end

      # JotForm doesn't accept the + sign in url params. It must be escaped with "{plusSign}".
      # See https://www.jotform.com/answers/779297-Form-Prepopulation-Not-possible-to-use-a-symbol
      def sanitize_value(value)
        value.to_s.gsub('+', '{plusSign}')
      end
    end
  end
end
