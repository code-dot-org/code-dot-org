class MakerController < ApplicationController
  authorize_resource class: :maker_discount, only: :discountcode

  def setup
  end

  def discountcode
    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    render 'discountcode', locals: {script_data: application_status}
  end
end
