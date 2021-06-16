module Pd
  class WorkshopDailySurveyController < ApplicationController
    include WorkshopConstants
    include WorkshopSurveyConstants
    include WorkshopSurveyFoormConstants

    # Require login
    authorize_resource class: 'Pd::Enrollment'

    # General workshop daily survey for CSP and CSD, non-academic year workshops.
    # GET '/pd/workshop_survey/day/:day'
    # Will render new_pre_foorm if day == 0, new_daily_foorm otherwise
    def new_general
      # If workshop is n days long, Accept days 0 -> [n - 1]. Day n should use the post survey
      day = params[:day].to_i
      if day == 0
        return new_pre_foorm
      else
        return new_daily_foorm
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

    # Post workshop survey. This one will be emailed and displayed in the my PL page,
    # and can persist for more than a day, so it uses an enrollment code to be tied to a specific workshop.
    # GET /pd/workshop_survey/post/:enrollment_code
    # This will direct to new_post_foorm
    def new_post
      return new_post_foorm
    end

    # Display CSF201 (Deep Dive) pre-workshop survey using Foorm.
    # GET workshop_survey/csf/pre201
    def new_csf_pre201
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
      # or search all CSF101 workshops the current user is enrolled in and attended.
      attended_workshop = get_workshop_by_enrollment_or_course_and_subject(
        enrollment_code: params[:enrollment_code],
        course: COURSE_CSF,
        subject: SUBJECT_CSF_101
      )
      return unless attended_workshop

      survey_name = POST_SURVEY_CONFIG_PATHS[SUBJECT_CSF_101]

      render_survey_foorm(survey_name: survey_name, workshop: attended_workshop, session: nil, day: nil)
    end

    # Display CSF201 (Deep Dive) post-workshop survey using Foorm.
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

      survey_name = POST_SURVEY_CONFIG_PATHS[SUBJECT_CSF_201]
      render_survey_foorm(survey_name: survey_name, workshop: attended_workshop, session: nil, day: nil)
    end

    # GET /pd/workshop_survey/thanks
    def thanks
    end

    # Pre survey controller for academic year workshops
    def new_ayw_pre
      ayw_helper(survey_names: PRE_SURVEY_CONFIG_PATHS, day: 0)
    end

    def new_ayw_daily
      ayw_helper(survey_names: DAILY_SURVEY_CONFIG_PATHS, day: params[:day])
    end

    def new_ayw_post
      ayw_helper(survey_names: POST_SURVEY_CONFIG_PATHS, day: nil)
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
      workshop = Pd::Enrollment.find_by(code: enrollment_code, user: current_user)&.workshop

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

    def ayw_helper(survey_names:, day:)
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

      @unit_data = {
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

    def get_session_for_workshop_and_day(workshop, day)
      day > 0 ? workshop.sessions[day - 1] : nil
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
