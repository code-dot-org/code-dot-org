module Pd
  module JotForm
    module EmbedHelper
      # Generates an iframe tag that will render a JotForm form
      # @param form_id [Integer]
      # @param params [Hash] parameters to pass to the form, shaped {question_name => initial value}
      def jotform_iframe(form_id, params)
        content_tag :iframe, nil, id: "JotFormIFrame-#{form_id}", onload: "window.parent.scrollTo(0,0)", allowtransparency: "true", allowfullscreen: "true", allow: "geolocation; microphone; camera", src: jotform_form_url(form_id, params), frameborder: "0", style: "width: 1px; min-width: 100%; height:539px; border:none;", scrolling: "no"
      end

      def jotform_form_url(form_id, params)
        "https://form.jotform.com/#{form_id}?#{format_url_params(params)}"
      end

      # If the DCDO setting 'jotform_redirect' is enabled,
      # this method causes the server to respond with a 302,
      # redirecting the browser to the JotForm form URL (instead of following our usual flow,
      # embedding the form within our own chrome).
      # @return [Boolean] whether the experiment is enabled and a redirect occurred
      def experimental_redirect!(form_id, params)
        DCDO.get('jotform_redirect', false).tap do |experiment_enabled|
          redirect_to jotform_form_url form_id, params if experiment_enabled
        end
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
