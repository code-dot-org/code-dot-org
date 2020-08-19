module Pd
  class WorkshopDailySurveyController < ApplicationController
    include WorkshopConstants
    include JotForm::EmbedHelper
    include WorkshopSurveyConstants
    include WorkshopSurveyFoormConstants

    # The POST submit route will be redirected to from JotForm, after form submission
    skip_before_action :verify_authenticity_token, only: %w(submit_general submit_facilitator)

    # Require login
    authorize_resource class: 'Pd::Enrollment'

    # General workshop daily survey.
    # GET '/pd/workshop_survey/day/:day'
    # Where day 0 is the pre-workshop survey, and days 1-5 are the 1st through 5th sessions (index 0-4)
    #
    # The JotForm survey, on submit, will redirect to the new_facilitator route (see below)
    # for the relevant session id.
    # The pre-workshop survey, which has no session id, will redirect to thanks.
    # This will redirect to new foorm surveys if the teacher is enrolled in a summer workshop,
    # or show the JotForm survey if the teacher is enrolled in a CSP Workshop for Returning Teachers.
    # Otherwise it will show a not enrolled message.
    def new_general
      # Accept days 0 through 4. Day 5 is the post workshop survey and should use the new_post route
      day = params[:day].to_i
      should_have_attended = day != 0
      # only summer workshops and CSP for returning teachers are supported by this URL
      workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: params[:enrollmentCode],
        course: [COURSE_CSD, COURSE_CSP],
        subject: [SUBJECT_SUMMER_WORKSHOP, SUBJECT_CSP_FOR_RETURNING_TEACHERS],
        should_have_attended: should_have_attended
      )

      # Do nothing if there is no workshop.
      return unless workshop

      # Use Foorm for local summer workshops. This preserves the legacy url, which facilitators may
      # have saved.
      if workshop.local_summer?
        if day == 0
          return new_pre_foorm
        else
          return new_daily_foorm
        end
      end

      # Beyond here is for a non-Foorm survey.

      unless validate_new_general_parameters(workshop)
        return
      end

      session = get_session_for_workshop_and_day(workshop, day)

      @form_id = WorkshopDailySurvey.get_form_id_for_subject_and_day workshop.subject, day

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        workshopId: workshop.id,
        day: day,
        formId: @form_id,
        sessionId: session&.id
      }

      return redirect_general(key_params) if response_exists_general?(key_params)

      @form_params = key_params.merge(
        userName: current_user.name,
        userEmail: current_user.email,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        submitRedirect: url_for(action: 'submit_general', params: {key: key_params})
      )

      return if experimental_redirect! @form_id, @form_params

      if CDO.newrelic_logging
        NewRelic::Agent.record_custom_event(
          "RenderJotFormView",
          {
            route: "GET /pd/workshop_survey/day/#{day}",
            form_id: @form_id,
            workshop_course: workshop.course,
            workshop_subject: workshop.subject,
            regional_partner_name: workshop.regional_partner&.name,
          }
        )
      end
    end

    # General workshop daily survey using foorm system.
    # GET '/pd/workshop_daily_survey/day/:day?enrollmentCode=code'
    # Enrollment code is an optional parameter, otherwise will show most recent workshop.
    # Accepts any day greater than 0 and less than or equal to the number of sessions in the workshop
    # (pre and post surveys should use the pre-survey and post-survey routes, respectively).
    #
    # If survey has been already completed for the given day will redirect to thanks page.
    def new_daily_foorm
      day = params[:day].to_i
      if day <= 0
        return render_404
      end

      workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: params[:enrollmentCode],
        course: [COURSE_CSD, COURSE_CSP],
        subject: [SUBJECT_SUMMER_WORKSHOP, SUBJECT_CSP_FOR_RETURNING_TEACHERS],
        should_have_attended: true
      )
      return unless workshop

      if workshop.sessions.size <= day
        return render_404
      end

      session = get_session_for_workshop_and_day(workshop, day)
      unless validate_session_for_survey(session, workshop, day)
        return
      end

      survey_name = DAILY_SURVEY_CONFIG_PATHS[workshop.subject]
      render_survey_foorm(survey_name: survey_name, workshop: workshop, session: session, day: day)
    end

    # General pre-workshop survey using foorm system.
    # GET '/pd/workshop_pre_survey?enrollmentCode=code'
    # Enrollment code is an optional parameter, otherwise will show most recent workshop.
    #
    # If the pre-survey has been already completed, will redirect to thanks page.
    def new_pre_foorm
      new_general_foorm(survey_names: PRE_SURVEY_CONFIG_PATHS, day: 0)
    end

    # General post-workshop survey using foorm system.
    # GET '/pd/workshop_post_survey?enrollmentCode=code'
    # Enrollment code is an optional parameter, otherwise will show most recent workshop.
    #
    # If the post-survey has been already completed, will redirect to thanks page.
    def new_post_foorm
      new_general_foorm(survey_names: POST_SURVEY_CONFIG_PATHS, day: nil)
    end

    def new_general_foorm(survey_names:, day:, subject: FOORM_GENERAL_SURVEY_SUBJECTS)
      # We may be redirecting from our legacy route which uses enrollment_code
      enrollment_code = params[:enrollmentCode] || params[:enrollment_code]
      # want to check attendance for any survey except the pre-survey (day 0)
      should_have_attended = day != 0
      workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: enrollment_code,
        course: [COURSE_CSD, COURSE_CSP],
        subject: subject,
        should_have_attended: should_have_attended
      )

      return unless workshop

      agenda = params[:agenda] || nil

      # remove / from agenda url so module/1 => module1
      agenda.tr!("/", "") if agenda

      survey_name = survey_names[workshop.subject]
      render_survey_foorm(survey_name: survey_name, workshop: workshop, session: nil, day: day, workshop_agenda: agenda)
    end

    # POST /pd/workshop_survey/submit
    def submit_general
      WorkshopDailySurvey.create_placeholder!(
        user_id: key_params[:userId],
        pd_workshop_id: key_params[:workshopId],
        day: key_params[:day],
        form_id: key_params[:formId],
        submission_id: params[:submission_id]
      )

      key_params[:enrollmentCode].present? ? redirect_post(key_params) : redirect_general(key_params)
    end

    # Facilitator-specific questions
    # GET /pd/workshop_survey/facilitators/:session_id(/:facilitator_index)
    # :session_id is the id of the workshop session.
    # :facilitator_index is the optional (default 0, first) index in sorted session.workshop.facilitators
    #
    # The JotForm survey, on submit, will redirect back to this same route, but with
    # facilitatorPosition as facilitator_index, thus incrementing it by 1.
    def new_facilitator
      session = Session.find(params[:session_id])
      workshop = session.workshop
      day = workshop.sessions.index(session) + 1

      # Post workshop survey (last day) does not need to be taken while the session is still open,
      # and has less strict attendance requirements.
      unless day == workshop.sessions.size
        return render :too_late unless session.open_for_attendance?

        attendance = session.attendances.find_by(teacher: current_user)
        return render :no_attendance unless attendance
      end

      facilitator_index = params[:facilitator_index]&.to_i || 0
      facilitators = workshop.facilitators.order(:name, :id)
      facilitator = facilitators[facilitator_index]

      # Out of facilitators? Done.
      return redirect_to action: :thanks unless facilitator

      @form_id = WorkshopFacilitatorDailySurvey.form_id workshop.subject

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        day: day,
        sessionId: session.id,
        facilitatorId: facilitator.id,
        facilitatorIndex: facilitator_index,
        formId: @form_id,
      }

      return redirect_facilitator(key_params) if response_exists_facilitator?(key_params)

      @form_params = key_params.merge(
        workshopId: workshop.id,
        userName: current_user.name,
        userEmail: current_user.email,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        facilitatorPosition: facilitator_index + 1,
        facilitatorName: facilitator.name,
        numFacilitators: facilitators.size,
        submitRedirect: url_for(action: 'submit_facilitator', params: {key: key_params})
      )

      return if experimental_redirect! @form_id, @form_params

      if CDO.newrelic_logging
        NewRelic::Agent.record_custom_event(
          "RenderJotFormView",
          {
            route: "GET /pd/workshop_survey/facilitators/#{session.id}/#{facilitator_index}",
            form_id: @form_id,
            workshop_course: workshop.course,
            workshop_subject: workshop.subject,
            regional_partner_name: workshop.regional_partner&.name,
          }
        )
      end
    end

    # POST /pd/workshop_survey/facilitators/submit
    def submit_facilitator
      WorkshopFacilitatorDailySurvey.create_placeholder!(
        user_id: key_params[:userId],
        day: key_params[:day],
        pd_session_id: key_params[:sessionId],
        facilitator_id: key_params[:facilitatorId],
        form_id: key_params[:formId],
        submission_id: params[:submission_id]
      )

      redirect_facilitator(key_params)
    end

    # Post workshop survey. This one will be emailed and displayed in the my PL page,
    # and can persist for more than a day, so it uses an enrollment code to be tied to a specific workshop.
    # GET /pd/workshop_survey/post/:enrollment_code
    def new_post
      workshop = get_workshop_by_enrollment(enrollment_code: params[:enrollment_code], should_have_attended: true)
      return unless workshop

      # Use Foorm for local summer workshops. This preserves the legacy url, which facilitators may
      # have saved.
      if workshop.local_summer?
        return new_post_foorm
      end

      session = workshop.sessions.last
      session_count = workshop.last_valid_day
      return render_404 unless session

      begin
        @form_id = WorkshopDailySurvey.get_form_id_for_subject_and_day workshop.subject, POST_WORKSHOP_FORM_KEY
      rescue
        @form_id = WorkshopDailySurvey.get_form_id_for_subject_and_day workshop.subject, session_count
      end

      return redirect_to :pd_workshop_survey_thanks if WorkshopDailySurvey.exists?(user: current_user, pd_workshop: workshop, form_id: @form_id)

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        workshopId: workshop.id,
        day: session_count,
        formId: @form_id,
        sessionId: session&.id,
        enrollmentCode: params[:enrollment_code]
      }

      return redirect_post(key_params) if response_exists_general?(key_params)

      @form_params = key_params.merge(
        userName: current_user.name,
        userEmail: current_user.email,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        submitRedirect: url_for(action: 'submit_general', params: {key: key_params})
      )

      return if experimental_redirect! @form_id, @form_params

      # Same view as the general daily survey
      render :new_general
    end

    # Display CSF201 (Deep Dive) pre-workshop survey.
    # GET workshop_survey/csf/pre201
    def new_csf_pre201
      # Find the closest CSF 201 workshop the current user enrolled in.
      workshop = Pd::Workshop.
        where(course: COURSE_CSF, subject: SUBJECT_CSF_201).
        enrolled_in_by(current_user).nearest

      return render :not_enrolled unless workshop
      return render :too_late unless workshop.state != STATE_ENDED

      render_csf_survey(PRE_DEEPDIVE_SURVEY, workshop)
    end

    # Display CSF201 (Deep Dive) pre-workshop survey using Foorm.
    # Temporary separate method for testing--will eventually replace new_csf_pre201
    # once all CSF201 surveys are converted to Foorm
    # GET workshop_survey/foorm/csf/pre201
    def new_csf_pre201_foorm
      # Find the closest CSF 201 workshop the current user enrolled in.
      workshop = get_workshop_by_course_and_subject(
        course: COURSE_CSF,
        subject: SUBJECT_CSF_201,
        should_have_attended: false
      )

      return unless workshop
      return render :too_late unless workshop.state != STATE_ENDED

      survey_name = PRE_SURVEY_CONFIG_PATHS[SUBJECT_CSF_201]
      render_survey_foorm(survey_name: survey_name, workshop: workshop, session: nil, day: 0)
    end

    # Display CSF101 (Intro) post-workshop survey.
    # The survey, on submit, will display thanks.
    # GET /pd/workshop_survey/csf/post101(/:enrollment_code)
    def new_csf_post101
      # Use enrollment_code to find a specific workshop
      # or search all CSF101 workshops the current user is enrolled in.
      attended_workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: params[:enrollment_code],
        course: COURSE_CSF,
        subject: SUBJECT_CSF_101
      )
      return unless attended_workshop

      survey_name = POST_SURVEY_CONFIG_PATHS[SUBJECT_CSF_101]

      render_survey_foorm(survey_name: survey_name, workshop: attended_workshop, session: nil, day: nil)
    end

    # Display CSF201 (Deep Dive) post-workshop survey.
    # The JotForm survey, on submit, will redirect to the new_facilitator route for user
    # to submit facilitator surveys.
    # GET workshop_survey/csf/post201(/:enrollment_code)
    def new_csf_post201
      # Use enrollment_code to find a specific workshop
      # or search all CSF201 workshops the current user is enrolled in and attended.
      attended_workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: params[:enrollment_code],
        course: COURSE_CSF,
        subject: SUBJECT_CSF_201
      )
      return unless attended_workshop

      render_csf_survey(POST_DEEPDIVE_SURVEY, attended_workshop)
    end

    # Display CSF201 (Deep Dive) post-workshop survey using Foorm.
    # Temporary separate method for testing--will eventually replace new_csf_post201
    # once all CSF201 surveys are converted to Foorm
    # GET workshop_survey/foorm/csf/post201
    def new_csf_post201_foorm
      # Use enrollment_code to find a specific workshop
      # or search all CSF201 workshops the current user is enrolled in and attended.
      attended_workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: params[:enrollment_code],
        course: COURSE_CSF,
        subject: SUBJECT_CSF_201
      )
      return unless attended_workshop

      survey_name = POST_SURVEY_CONFIG_PATHS[SUBJECT_CSF_201]
      render_survey_foorm(survey_name: survey_name, workshop: attended_workshop, session: nil, day: nil)
    end

    # GET /pd/workshop_survey/thanks
    def thanks
    end

    # Pre survey controller for academic year workshops
    def new_ayw_pre
      ayw_helper(PRE_SURVEY_CONFIG_PATHS, day: 0)
    end

    def new_ayw_daily
      ayw_helper(DAILY_SURVEY_CONFIG_PATHS, day: params[:day])
    end

    def new_ayw_post
      ayw_helper(POST_SURVEY_CONFIG_PATHS, day: nil)
    end

    protected

    # This method finds a workshop either by enrollment code or by the given course and subject.
    # @param enrollment_code String: enrollment code for a workshop
    # @param course String: name of course (ex. CS Principles)
    # @param subject String: name of subject (ex. Academic Year 1)
    # @param should_have_attended Boolean (default true): If true, check that the user has attended the workshop, and
    # if they have not, render not_attended. If false, don't check the teacher's attendance (this is useful for
    # pre-surveys, where we don't care about attendance for surveys to be available)
    # It works as follows:
    # - If an enrollment_code is given, find the enrollment for that code. Check attendance for the current user
    #  if should_have_attended is true.
    # - If an enrollment code was not given, look for the workshops the current user has enrolled in with the given
    # course and subject. If they have none, render not enrolled. If they have any and should_have_attended is false,
    # return the most recent workshop. If should_have_attended is true, return the most recent workshop the user has
    # attended, or render no attendance if the user has not attended any workshops.
    def get_workshop_by_enrollment_or_course_and_subject(enrollment_code:, course:, subject:, should_have_attended: true)
      if enrollment_code
        return get_workshop_by_enrollment(enrollment_code: enrollment_code, should_have_attended: should_have_attended)
      else
        return get_workshop_by_course_and_subject(course: course, subject: subject, should_have_attended: should_have_attended)
      end
    end

    def get_workshop_by_enrollment(enrollment_code:, should_have_attended:)
      workshop = Workshop.by_enrollment_code(enrollment_code, current_user)

      unless workshop
        render :invalid_enrollment_code
        return false
      end
      if !should_have_attended || workshop.user_attended?(current_user)
        return workshop
      else
        render :no_attendance
        return false
      end
    end

    def get_workshop_by_course_and_subject(course:, subject:, should_have_attended:)
      enrolled_workshops = Workshop.
        where(course: course, subject: subject).
        enrolled_in_by(current_user)

      if enrolled_workshops.blank?
        render :not_enrolled
        return false
      end

      workshop = should_have_attended ?
                   enrolled_workshops.with_nearest_attendance_by(current_user) :
                   enrolled_workshops.nearest

      # If workshop_to_return is nil here and we haven't already returned, it means there was no attendance
      unless workshop
        render :no_attendance
        return false
      end

      # otherwise return the workshop
      workshop
    end

    def response_exists_general?(key_params)
      WorkshopDailySurvey.response_exists?(
        user_id: key_params[:userId],
        pd_workshop_id: key_params[:workshopId],
        day: key_params[:day],
        form_id: key_params[:formId]
      )
    end

    def redirect_general(key_params)
      session_id = key_params[:sessionId]

      if session_id.present?
        redirect_to action: :new_facilitator, session_id: session_id, facilitator_index: 0
      else
        redirect_to action: :thanks
      end
    end

    def response_exists_facilitator?(key_params)
      WorkshopFacilitatorDailySurvey.response_exists?(
        user_id: key_params[:userId],
        pd_session_id: key_params[:sessionId],
        facilitator_id: key_params[:facilitatorId],
        form_id: key_params[:formId]
      )
    end

    def redirect_facilitator(key_params)
      session = Session.find(key_params[:sessionId])
      session_size = session.workshop.sessions.size
      next_facilitator_index = key_params[:facilitatorIndex].to_i + 1

      if next_facilitator_index.between?(1, session.workshop.facilitators.size - 1)
        redirect_to action: :new_facilitator,
          session_id: session.id, facilitator_index: next_facilitator_index
      # No facilitators left. Academic workshops redirect to post if its the last day.
      # Summer workshops and CSF 201 workshops redirect to thanks.
      elsif !session.workshop.summer? &&
        !session.workshop.csf_201? && key_params[:day].to_i == session_size
        enrollment_code = Pd::Enrollment.find_by(user: current_user, workshop: session.workshop).code
        redirect_to action: :new_post, enrollment_code: enrollment_code
      else
        redirect_to action: :thanks
      end
    end

    def redirect_post(key_params)
      session = Session.find(key_params[:sessionId])
      if session.workshop.summer?
        redirect_to action: :new_facilitator, session_id: session.id, facilitator_index: 0
      else
        redirect_to action: :thanks
      end
    end

    def render_csf_survey(survey_name, workshop)
      @form_id = WorkshopDailySurvey.get_form_id CSF_CATEGORY, survey_name

      # There are facilitator surveys after post workshop survey.
      # Use sessionId to create URL query to those facilitator surveys.
      session_id = survey_name == POST_DEEPDIVE_SURVEY ? workshop.sessions.first&.id : nil

      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        workshopId: workshop.id,
        day: CSF_SURVEY_INDEXES[survey_name],
        sessionId: session_id,
        formId: @form_id
      }

      @form_params = key_params.merge(
        userName: current_user.name,
        userEmail: current_user.email,
        submitRedirect: url_for(action: 'submit_general', params: {key: key_params})
      )

      return redirect_general(key_params) if response_exists_general?(key_params)
      return if experimental_redirect! @form_id, @form_params

      if CDO.newrelic_logging
        NewRelic::Agent.record_custom_event(
          "RenderJotFormView",
          {
            route: "GET /pd/workshop_survey/csf/#{survey_name}",
            form_id: @form_id,
            workshop_course: workshop.course,
            workshop_subject: workshop.subject,
            regional_partner_name: workshop.regional_partner&.name,
          }
        )
      end

      render :new_general
    end

    def ayw_helper(survey_names, day:)
      # get workshop (based on url/user)
      workshop_subject = ACADEMIC_YEAR_WORKSHOPS[params[:workshop_subject]]
      return render_404 unless workshop_subject

      new_general_foorm(survey_names: survey_names, day: day, subject: workshop_subject)
    end

    def render_survey_foorm(survey_name:, workshop:, session:, day:, workshop_agenda: nil)
      return render_404 unless survey_name

      if !params[:force_show] && Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(
        current_user.id,
        workshop.id,
        session&.id,
        day,
        survey_name,
        workshop_agenda
      )
        render :thanks
        return
      end

      form_questions, latest_version = ::Foorm::Form.get_questions_and_latest_version_for_name(survey_name)

      @script_data = {
        props: {
          formQuestions: form_questions,
          formName: survey_name,
          formVersion: latest_version,
          surveyData: get_foorm_survey_data(workshop, day, workshop_agenda),
          submitApi: FOORM_SUBMIT_API,
          submitParams: {
            user_id: current_user.id,
            pd_session_id: session&.id,
            day: day,
            pd_workshop_id: workshop.id,
            workshop_agenda: workshop_agenda
          }
        }.to_json
      }

      render :new_general_foorm
    end

    def key_params
      @key_params ||= params.require(:key).tap do |key_params|
        raise ActiveRecord::RecordNotFound unless key_params[:environment] == Rails.env
      end
    end

    def get_session_for_workshop_and_day(workshop, day)
      day > 0 ? workshop.sessions[day - 1] : nil
    end

    def validate_new_general_parameters(workshop)
      # Accept days 0 through 4. Day 5 is the post workshop survey and should use the new_post route
      day = params[:day].to_i
      if day < 0
        render_404
        return false
      end

      # There's no pre-workshop survey for academic year workshops and
      # there's no post workshop survey for summer workshops
      if (day == 0 && !workshop.summer?) || (day == 5 && workshop.summer?)
        render_404
        return false
      end

      if day > 0
        session = get_session_for_workshop_and_day(workshop, day)
        return validate_session_for_survey(session, workshop, day)
      end
      return true
    end

    def validate_session_for_survey(session, workshop, day)
      unless session
        render_404
        return false
      end
      unless params[:bypass_date] || session.open_for_attendance? || day == workshop.sessions.size
        render :too_late
        return false
      end
      unless session.attendances.exists?(teacher: current_user)
        render :no_attendance
        return false
      end
      return true
    end

    def get_foorm_survey_data(workshop, day=nil, workshop_agenda=nil)
      facilitator_data = workshop.facilitators.each_with_index.map do |facilitator, i|
        {
          Pd::WorkshopSurveyFoormConstants::FACILITATOR_ID => facilitator.id,
          Pd::WorkshopSurveyFoormConstants::FACILITATOR_NAME => facilitator.name,
          Pd::WorkshopSurveyFoormConstants::FACILITATOR_POSITION => i + 1
        }
      end

      regional_partner_name = ''
      if workshop.regional_partner_id
        regional_partner_name = RegionalPartner.find(workshop.regional_partner_id).name
      end

      return {
        Pd::WorkshopSurveyFoormConstants::FACILITATORS => facilitator_data,
        workshop_course: workshop.course,
        workshop_subject: workshop.subject,
        regional_partner_name: regional_partner_name,
        is_virtual: workshop.virtual?,
        num_facilitators: workshop.facilitators.count,
        day: day,
        is_friday_institute: workshop.friday_institute?,
        workshop_agenda: workshop_agenda
      }
    end
  end
end
