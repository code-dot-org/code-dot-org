module Pd
  class WorkshopDailySurveyController < ApplicationController
    include WorkshopConstants
    include JotForm::EmbedHelper

    # Require login
    authorize_resource class: 'Pd::Enrollment'

    # General workshop daily survey.
    # GET '/pd/workshop_survey/day/:day'
    # Where day 0 is the pre-workshop survey, and days 1-5 are the 1st through 5th sessions (index 0-4)
    #
    # The JotForm survey, on submit, will redirect to the new_faciliator route (see below)
    # for the relevant session id.
    # The pre-workshop survey, which has no session id, will redirect to thanks.
    def new_general
      workshop = Workshop.where(subject: SUBJECT_SUMMER_WORKSHOP).enrolled_in_by(current_user).nearest
      return render :not_enrolled unless workshop

      day = params[:day].to_i

      # Accept days 0 through 4. Day 5 is the post workshop survey and should use the new_post route
      return render_404 if day < 0 || day > 4
      session = nil
      if day > 0
        session = workshop.sessions[day - 1]
        return render_404 unless session
        return render :too_late unless session.open_for_attendance?

        return render :no_attendance unless session.attendances.exists?(teacher: current_user)
      end

      @form_id = WorkshopDailySurvey.get_form_id_for_day day

      @form_params = {
        environment: Rails.env,
        userId: current_user.id,
        userName: current_user.name,
        userEmail: current_user.email,
        workshopId: workshop.id,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        sessionId: session&.id,
        day: day
      }
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

      return render :too_late unless session.open_for_attendance?

      attendance = session.attendances.find_by(teacher: current_user)
      return render :no_attendance unless attendance

      facilitator_index = params[:facilitator_index]&.to_i || 0
      facilitators = workshop.facilitators.order(:name, :id)
      facilitator = facilitators[facilitator_index]

      # Out of facilitators? Done.
      return redirect_to action: :thanks unless facilitator

      @form_id = WorkshopFacilitatorDailySurvey.form_id

      @form_params = {
        environment: Rails.env,
        userId: current_user.id,
        userName: current_user.name,
        userEmail: current_user.email,
        workshopId: workshop.id,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        sessionId: session.id,
        day: workshop.sessions.index(session) + 1,
        facilitatorId: facilitator.id,
        facilitatorName: facilitator.name,
        facilitatorPosition: facilitator_index + 1,
        numFacilitators: facilitators.size
      }
    end

    # Post workshop survey. This one will be emailed and displayed in the my PL page,
    # and can persist for more than a day, so it uses an enrollment code to be tied to a specific workshop.
    # GET /pd/workshop_survey/post/:enrollment_code
    def new_post
      enrollment = Enrollment.find_by!(code: params[:enrollment_code])
      workshop = enrollment.workshop

      return redirect_to :thanks if WorkshopDailySurvey.exists?(user: current_user, pd_workshop: workshop)
      @form_id = WorkshopDailySurvey.get_form_id_for_day 5

      @form_params = {
        environment: Rails.env,
        userId: current_user.id,
        userName: current_user.name,
        userEmail: current_user.email,
        workshopId: workshop.id,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        day: 5
      }

      # Same view as the general daily survey
      render :new_general
    end

    # GET /pd/workshop_survey/thanks
    def thanks
    end
  end
end
