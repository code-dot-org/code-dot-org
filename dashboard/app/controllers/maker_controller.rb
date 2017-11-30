class MakerController < ApplicationController
  authorize_resource class: :maker_discount, except: :setup

  def setup
  end

  def discountcode
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    render 'discountcode', locals: {script_data: application_status}
  end

  # begins a discount code application
  def apply
    intention = params.require(:unit_6_intention)

    # check to see if we have an existing application for any users associated with
    # this studio_person_id (in which case we can't start another)
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :forbidden if application

    # validate that we're eligible
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    return head :forbidden unless application_status[:is_pd_eligible] && application_status[:is_progress_eligible]

    # finally, create our application
    application = CircuitPlaygroundDiscountApplication.create!(user: current_user, unit_6_intention: intention)

    render json: {eligible: application.eligible_unit_6_intention?}
  end

  def schoolchoice
    school_id = params.require(:nces)

    school = School.find(school_id)

    # Must have started an application, and have said they were teaching unit 6
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :not_found unless application
    return head :forbidden unless application.eligible_unit_6_intention? && !application.has_confirmed_school

    # Update user's school if provided school_id is different
    current_school_id = current_user.try(:school_info).try(:school_id)
    if school_id != current_school_id
      current_user.update!(school_info: SchoolInfo.find_by_school_id(school_id))
    end

    application.update!(has_confirmed_school: true, full_discount: school.high_needs?)

    render json: {full_discount: application.full_discount?}
  end

  def complete
    signature = params.require(:signature)

    # Must have started an application, and have said they were teaching unit 6, and confirmed their school
    application = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(current_user.studio_person_id)
    return head :not_found unless application
    return head :forbidden unless application.eligible_unit_6_intention? &&
      application.has_confirmed_school && !application.circuit_playground_discount_code_id

    code = CircuitPlaygroundDiscountCode.claim(application.full_discount?)
    return head :not_found unless code

    # associate the code with this application, and log signature
    application.update!(signature: signature, signed_at: DateTime.now, circuit_playground_discount_code_id: code.id)

    render json: {code: code.code}
  end
end
