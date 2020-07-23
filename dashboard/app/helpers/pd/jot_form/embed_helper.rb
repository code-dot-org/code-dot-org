module Pd
  module JotForm
    module EmbedHelper
      # Generates an iframe tag that will render a JotForm form
      # @param form_id [Integer]
      # @param params [Hash] parameters to pass to the form, shaped {question_name => initial value}
      def jotform_iframe(form_id, params)
        content_tag :iframe, nil, id: "JotFormIFrame-#{form_id}", onload: "window.parent.scrollTo(0,0)", allowtransparency: "true", allowfullscreen: "true", allow: "geolocation; microphone; camera", sandbox: "allow-forms allow-same-origin allow-scripts allow-top-navigation", src: jotform_form_url(form_id, params), frameborder: "0", style: "width: 1px; min-width: 100%; height:539px; border:none;", scrolling: "no"
      end

      def jotform_form_url(form_id, params)
        "https://form.jotform.com/#{form_id}?#{format_url_params(params)}"
      end

      # These forms have had the "Continue Forms Later" advanced setting disabled
      # to work around a bug we've encountered when loading JotForm surveys directly
      # on JotForm's site.
      # https://www.jotform.com/answers/1894693-Fields-values-do-not-update-while-changing-the-values-on-URL-parameters-if-autofill-is-enabled-
      JOTFORM_EXPERIMENTAL_REDIRECT_FORMS = [
        '90986506471163', # 2019 Five-Day Workshop Survey - Day 1
        '90986458251165', # 2019 Five-Day Workshop Survey - Day 2
        '90986477669179', # 2019 Five-Day Workshop Survey - Day 3
        '90986953273169', # 2019 Five-Day Workshop Survey - Day 4
        '91372090131144'  # 2019 K-12 Facilitator {facilitatorPosition} of {numFacilitators}
      ]

      # Return true if the given form id is eligible for the JotForm redirect experiment
      # @param [String|Integer] form_id
      def form_in_experiment?(form_id)
        JOTFORM_EXPERIMENTAL_REDIRECT_FORMS.map(&:to_i).include? form_id.to_i
      end

      # If the DCDO setting 'jotform_redirect' is enabled,
      # and other experimental conditions are met,
      # this method causes the server to respond with a 302,
      # redirecting the browser to the JotForm form URL (instead of following our usual flow,
      # embedding the form within our own chrome).
      # @return [Boolean] whether the experiment is enabled and a redirect occurred
      def experimental_redirect!(form_id, params)
        # Check if the experiment is enabled at all
        return false unless DCDO.get('jotform_redirect', false)

        # Restrict the experiment to certain forms
        return false unless form_in_experiment? form_id

        # A/B test by restricting the experiment to signed-in users with an even-numbered user id
        return false unless current_user
        return false unless current_user.id.even?

        # All conditions passed - execute the experiment
        redirect_to jotform_form_url form_id, params
        true
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
