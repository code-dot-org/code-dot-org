module Pd
  class MiscSurveyController < ApplicationController
    include JotForm::EmbedHelper

    # The POST submit route will be redirected to from JotForm, after form submission
    skip_before_action :verify_authenticity_token, only: %w(submit)

    # GET /pd/misc_survey/thanks
    def thanks
    end

    # General misc survey.
    # GET '/pd/misc_survey/:form_tag'
    #
    # The JotForm survey will redirect to thanks.
    def new
      form_data = Pd::MiscSurvey.find_form_data(params[:form_tag])
      return render_404 unless form_data && form_data[:allow_embed]

      @form_id = form_data[:form_id]

      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?
      return render :no_teacher_email unless current_user.email.present?

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        formId: @form_id
      }

      unless form_data[:allow_multiple_submissions]
        return redirect(key_params) if response_exists?(key_params)
      end

      @form_params = key_params.merge(
        submitRedirect: url_for(action: 'submit', params: {key: key_params})
      )

      return if experimental_redirect! @form_id, @form_params

      if CDO.newrelic_logging
        NewRelic::Agent.record_custom_event(
          "RenderJotFormView",
          {
            route: "GET /pd/misc_survey/#{@form_id}",
            form_id: @form_id
          }
        )
      end
    end

    # POST /pd/misc_survey/submit
    def submit
      MiscSurvey.create_placeholder!(
        user_id: key_params[:userId],
        form_id: key_params[:formId],
        submission_id: params[:submission_id]
      )

      redirect(key_params)
    end

    protected

    def response_exists?(key_params)
      MiscSurvey.response_exists?(
        user_id: key_params[:userId],
        form_id: key_params[:formId]
      )
    end

    def redirect(key_params)
      redirect_to action: :thanks
    end

    def key_params
      @key_params ||= params.require(:key).tap do |key_params|
        raise ActiveRecord::RecordNotFound unless key_params[:environment] == Rails.env
      end
    end
  end
end
