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
end
