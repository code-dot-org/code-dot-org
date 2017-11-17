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
    # TODO: write tests
    intention = params.require(:unit_6_intention)

    # check to see if we have an existing application for any users associated with
    # this studio_person_id

    # validate that we're eligible

    # finally, create our application
    application = CircuitPlaygroundDiscountApplication.create!(user: current_user, unit_6_intention: intention)

    render json: {valid: application.valid_unit_6_intention?}
  end
end
