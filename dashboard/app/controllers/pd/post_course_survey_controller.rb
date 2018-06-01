module Pd
  class PostCourseSurveyController < ApplicationController
    include JotForm::EmbedHelper

    # The POST submit route will be redirected to from JotForm, after form submission
    skip_before_action :verify_authenticity_token, only: 'submit'

    COURSES_BY_INITIALS = {
      csd: 'CS Discoveries',
      csp: 'CS Principles'
    }.stringify_keys.freeze

    # GET /pd/post_course_survey/:course_initials
    def new
      authenticate_user!
      course = COURSES_BY_INITIALS[params[:course_initials]]
      return render_404 unless course
      redirect_to action: 'thanks' if PostCourseSurvey.response_exists?(user_id: current_user.id, course: course)

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        csp_or_csd: course
      }

      @form_id = PostCourseSurvey.form_id
      @form_params = key_params.merge(
        submitRedirect: url_for(action: 'submit', params: {key: key_params})
      )
    end

    # POST /pd/post_course_survey/submit
    def submit
      submission_id = params[:submission_id]
      key_params = params.require(:key)
      return render_404 unless key_params[:environment] == Rails.env

      PostCourseSurvey.create_placeholder!(
        user_id: key_params[:userId],
        course: key_params[:csp_or_csd],
        submission_id: submission_id
      )

      redirect_to action: 'thanks'
    end

    # GET /pd/post_course_survey/thanks
    def thanks
    end
  end
end
