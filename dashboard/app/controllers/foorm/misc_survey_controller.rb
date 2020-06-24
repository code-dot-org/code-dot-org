module Foorm
  class MiscSurveyController < ApplicationController
    # General misc survey.
    # GET '/form/:misc_form_path'
    #
    # The JotForm survey will redirect to thanks.
    def new
      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?
      return render :no_teacher_email unless current_user.email.present?

      form_data = MiscSurvey.find_form_data(params[:misc_form_path])

      # Pass these params to the form to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
      }

      unless form_data[:allow_multiple_submissions]
        return render :thanks if response_exists?(key_params)
      end

      @form_params = {}
    end

    protected

    def response_exists?(key_params)
      MiscSurvey.exists?(
        user_id: key_params[:userId],
        misc_form_path: key_params[:misc_form_path]
      )
    end
  end
end
