module Foorm
  class MiscSurveyController < ApplicationController
    MISC_FOORM_SUBMIT_API = '/dashboardapi/v1/foorm/misc_survey_submission'

    # General misc survey.
    # GET '/form/:misc_form_path'
    # misc_form_path references the configuration in foorm/misc_survey, which maps a
    # form path to a set of survey variables and a form name.
    # Survey variables can be provided in the following format:
    # '/form/:misc_form_path?survey_data[variable1]=value1&survey_data[variable2]=value2'
    # If no variables are provided, will use survey variables from the configuration in foorm/misc_survey,
    # or use no variables if there are none in the configuration.
    def new
      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?
      return render :no_teacher_email unless current_user.email.present?

      form_data = MiscSurvey.find_form_data(params[:misc_form_path])
      return render_404 if !form_data || !form_data[:form_name]

      return render :survey_closed if MiscSurvey.form_disabled?(params[:misc_form_path])

      form_questions, latest_version = ::Foorm::Form.get_questions_and_latest_version_for_name(form_data[:form_name])
      return render_404 unless form_questions

      # Pass these params to the form to identify unique responses
      key_params = {
        user_id: current_user.id,
        misc_form_path: params[:misc_form_path]
      }

      unless form_data[:allow_multiple_submissions]
        return render :thanks if response_exists?(key_params)
      end

      @script_data = {
        props: {
          formQuestions: form_questions,
          formName: form_data[:form_name],
          formVersion: latest_version,
          surveyData: params[:survey_data] || form_data[:survey_data],
          submitApi: MISC_FOORM_SUBMIT_API,
          submitParams: key_params
        }.to_json
      }
    end

    protected

    def response_exists?(key_params)
      MiscSurvey.exists?(
        user_id: key_params[:user_id],
        misc_form_path: key_params[:misc_form_path]
      )
    end
  end
end
