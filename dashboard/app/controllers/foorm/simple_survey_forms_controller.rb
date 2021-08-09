module Foorm
  class SimpleSurveyFormsController < ApplicationController
    # Admin authorization is not used in other Foorm contexts (eg, creating new Form content in levelbuilder).
    # Admin is the most straightforward way to allow staff to publish surveys, so we use it here.
    before_action :require_admin, only: [:index, :new, :create]

    FOORM_SIMPLE_SURVEY_SUBMIT_API = '/dashboardapi/v1/foorm/simple_survey_submission'

    def create
      form = Foorm::Form.all.detect {|f| f.key == params[:form_key]}
      return head :bad_request unless form

      unless valid_survey_data?(params)
        return render status: :bad_request, json: {error: 'Must provide a name and value for any survey variables.'}
      end
      survey_data = parse_survey_data(params)

      begin
        # Leaving optional "kind" blank in form stores a blank string without intervention.
        # Store nil in that case.
        Foorm::SimpleSurveyForm.create!(
          kind: params[:kind].presence,
          path: params[:path],
          form_name: form.name,
          form_version: form.version,
          allow_multiple_submissions: params[:allow_multiple_submissions] == '1',
          survey_data: survey_data
        )
      # Admin only page, so return any errors in plain text.
      rescue StandardError => e
        return render status: :bad_request, json: {error: e.message}
      end

      render 'index'
    end

    # General simple survey.
    # GET '/form/:path'
    # path is used to find a configuration in foorm/simple_survey_forms, which maps a
    # to a set of survey variables and a form name.
    # Survey variables can be provided in the following format:
    # '/form/:path?survey_data[variable1]=value1&survey_data[variable2]=value2'
    # If no variables are provided, will use survey variables from the configuration in foorm/simple_survey_forms,
    # or use no variables if there are none in the configuration.
    def show
      return render :logged_out unless current_user
      return render :not_teacher unless current_user.teacher?
      return render :no_teacher_email unless current_user.email.present?

      form_data = SimpleSurveyForm.find_most_recent_form_for_path(params[:path])
      return render_404 unless form_data

      return render :survey_closed if SimpleSurveyForm.form_path_disabled?(params[:path])

      form_questions = ::Foorm::Form.get_questions_for_name_and_version(
        form_data[:form_name],
        form_data[:form_version]
      )

      return render_404 unless form_questions

      # Pass these params to the form to identify unique responses
      key_params = {
        user_id: current_user.id,
        simple_survey_form_id: form_data[:id]
      }

      unless form_data[:allow_multiple_submissions]
        return render :thanks if response_exists?(key_params)
      end

      @script_data = {
        props: {
          formQuestions: form_questions,
          formName: form_data[:form_name],
          formVersion: form_data[:form_version] || 0,
          surveyData: params[:survey_data] || form_data.survey_data,
          submitApi: FOORM_SIMPLE_SURVEY_SUBMIT_API,
          submitParams: key_params
        }.to_json
      }
    end

    # Gets a json format of a general misc survey.
    # GET '/form/:path/configuration'
    # This is intended for surveys that need to be integrated, with custom rendering, into
    # an existing page. One example of this is the NPS survey which is rendered as part
    # of the teacher homepage. The client will handle the custom rendering of the survey.
    def configuration
      return render json: {}, status: :no_content unless current_user&.teacher? && current_user.email.present?

      form_data = SimpleSurveyForm.find_most_recent_form_for_path(params[:path])
      return render json: {}, status: :no_content if !form_data || SimpleSurveyForm.form_path_disabled?(params[:path])

      form_questions = ::Foorm::Form.get_questions_for_name_and_version(
        form_data[:form_name],
        form_data[:form_version]
      )

      key_params = {
        user_id: current_user.id,
        simple_survey_form_id: form_data[:id]
      }

      return render json: {}, status: :no_content if !form_questions || (!form_data[:allow_multiple_submissions] && response_exists?(key_params))

      render json: @script_data = {
        props: {
          formQuestions: form_questions,
          formName: form_data[:form_name],
          formVersion: form_data[:form_version] || 0,
          surveyData: params[:survey_data] || form_data.survey_data,
          submitApi: FOORM_SIMPLE_SURVEY_SUBMIT_API,
          submitParams: key_params
        }.to_json
      }
    end

    protected

    def response_exists?(key_params)
      SimpleSurveySubmission.exists?(
        user_id: key_params[:user_id],
        simple_survey_form_id: key_params[:simple_survey_form_id]
      )
    end

    # Check that for any provided survey data,
    # we have both a key and a value.
    def valid_survey_data?(params)
      (0..2).to_a.each do |id|
        key = "survey_data_key_#{id}".to_sym
        value = "survey_data_value_#{id}".to_sym

        return false if params[key].blank? != params[value].blank?
      end

      true
    end

    # For any provided survey data, reshape into a single hash with the keys
    # representing variable names and the values to be inserted into the survey.
    # eg, if params: {survey_data_key_1: 'course', survey_data_value_1: 'CS Principles'}
    # returns: {'course' => 'CS Principles'}
    def parse_survey_data(params)
      survey_data = Hash.new

      (0..2).to_a.each do |id|
        key = "survey_data_key_#{id}".to_sym
        value = "survey_data_value_#{id}".to_sym

        survey_data[params[key]] = params[value] unless params[key].blank?
      end

      survey_data
    end
  end
end
