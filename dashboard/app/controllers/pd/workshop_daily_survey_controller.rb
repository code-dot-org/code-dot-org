module Pd
  class WorkshopDailySurveyController < ApplicationController
    include WorkshopConstants
    include JotForm::EmbedHelper

    skip_before_action :verify_authenticity_token, only: :test_post

    # Require login
    authorize_resource class: 'Pd::Enrollment'

    FORM_TYPE_LOCAL = 'local'

    def new
      workshop = find_nearest_enrolled_workshop(SUBJECT_SUMMER_WORKSHOP)
      return render :not_enrolled unless workshop

      # day 0 is the pre-workshop survey. Days 1,2,3... correspond to the 1st, 2nd, 3rd... session (index 0,1,2...)
      day = params[:day].to_i
      session = nil
      if day > 0
        session = workshop.sessions[day - 1]
        return render_404 unless session
        return render :too_late unless session.open_for_attendance?

        attendance = session.attendances.find_by(teacher: current_user)
        return render :no_attendance unless attendance
      end

      @form_params = {
        environment: Rails.env,
        user_id: current_user.id,
        user_name: current_user.name,
        user_email: current_user.email,
        workshop_id: workshop.id,
        workshop_course: workshop.course,
        workshop_subject: workshop.subject,
        regional_partner_name: workshop.regional_partner&.name,
        session_id: session&.id,
        day: day
      }

      @form_id = get_local_form_id "day_#{day}"
    end

    def new_facilitator
      return redirect_to action: :thanks unless params[:session_id]

      session = Pd::Session.find(params[:session_id])
      workshop = session.workshop
      return render :too_late unless session.open_for_attendance?

      attendance = session.attendances.find_by(teacher: current_user)
      return render :no_attendance unless attendance

      facilitators = workshop.facilitators.order(:name, :id)
      facilitator_index = params[:facilitator_index]&.to_i || 0
      facilitator = facilitators[facilitator_index]

      # Out of facilitators? Done.
      return redirect_to action: :thanks unless facilitator

      @form_id = get_local_form_id 'facilitator'

      @form_params = {
        environment: Rails.env,
        user_id: current_user.id,
        user_name: current_user.name,
        user_email: current_user.email,
        workshop_id: workshop.id,
        workshop_course: workshop.course,
        workshop_subject: workshop.subject,
        regional_partner_name: workshop.regional_partner&.name,
        session_id: session&.id,
        facilitator_id: facilitator.id,
        facilitator_name: facilitator.name,
        facilitator_position: facilitator_index + 1,
        num_facilitators: facilitators.size
      }.transform_keys {|k| k.to_s.camelize(:lower)}.to_param
    end

    protected

    def find_nearest_enrolled_workshop(subject)
      workshops = Pd::Workshop.includes(:sessions).enrolled_in_by(current_user).where(subject: subject)

      # Find closest to today
      workshops.flat_map(&:sessions).compact.min {|s| Date.today - s.start.to_date}&.workshop
    end

    def get_local_form_id(name)
      get_form_id(type: FORM_TYPE_LOCAL, name: name)
    end

    def get_form_id(type:, name:)
      raise "Missing jotform form type #{type}" unless CDO.jotform_forms&.key? type
      forms = CDO.jotform_forms[type]
      raise "Mising jotform form: #{type}.#{name}" unless forms.key? name
      forms[name]
    end
  end
end
