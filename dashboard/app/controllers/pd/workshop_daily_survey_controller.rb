module Pd
  class WorkshopDailySurveyController < ApplicationController
    include WorkshopConstants
    include JotForm::EmbedHelper
    include WorkshopSurveyConstants

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
    def new_general
      # Accept days 0 through 4. Day 5 is the post workshop survey and should use the new_post route
      day = params[:day].to_i
      return render_404 if day < 0

      workshop =
        if params[:enrollmentCode].present?
          Pd::Enrollment.find_by!(code: params[:enrollmentCode]).workshop
        else
          Workshop.
          where(course: [COURSE_CSD, COURSE_CSP]).
          where.not(subject: SUBJECT_FIT).
          nearest_attended_or_enrolled_in_by(current_user)
        end

      return render :not_enrolled unless workshop
      # There's no pre-workshop survey for academic year workshops
      return render_404 if day == 0 && !workshop.summer?
      # There's no post workshop survey for summer workshops
      return render_404 if day == 5 && workshop.summer?

      session = nil
      if day > 0
        session = workshop.sessions[day - 1]
        return render_404 unless session
        return render :too_late unless session.open_for_attendance? || day == workshop.sessions.size

        return render :no_attendance unless session.attendances.exists?(teacher: current_user)
      end

      @form_id = WorkshopDailySurvey.get_form_id_for_subject_and_day workshop.subject, day

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        workshopId: workshop.id,
        day: day,
        formId: @form_id,
        sessionId: session&.id,
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
      enrollment = Enrollment.find_by!(code: params[:enrollment_code])
      workshop = enrollment.workshop
      session = workshop.sessions.last
      session_count = workshop.sessions.size
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

    # Display CSF201 (Deep Dive) post-workshop survey.
    # The JotForm survey, on submit, will redirect to the new_facilitator route for user
    # to submit facilitator surveys.
    # GET workshop_survey/csf/post201(/:enrollment_code)
    def new_csf_post201
      # Use enrollment_code to find a specific workshop
      # or search all CSF201 workshops the current user enrolled in.
      enrolled_workshops = nil
      if params[:enrollment_code].present?
        enrolled_workshops = Workshop.joins(:enrollments).
          where(pd_enrollments: {code: params[:enrollment_code]})

        return render_404 if enrolled_workshops.blank?
      else
        enrolled_workshops = Workshop.
          where(course: COURSE_CSF, subject: SUBJECT_CSF_201).
          enrolled_in_by(current_user)

        return render :not_enrolled if enrolled_workshops.blank?
      end

      attended_workshop = enrolled_workshops.with_nearest_attendance_by(current_user)
      return render :no_attendance unless attended_workshop

      render_csf_survey(POST_DEEPDIVE_SURVEY, attended_workshop)
    end

    # GET /pd/workshop_survey/thanks
    def thanks
    end

    protected

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

    def key_params
      @key_params ||= params.require(:key).tap do |key_params|
        raise ActiveRecord::RecordNotFound unless key_params[:environment] == Rails.env
      end
    end
  end
end
