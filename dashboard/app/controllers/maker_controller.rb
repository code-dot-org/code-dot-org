class MakerController < ApplicationController
  before_action :authenticate_user!, only: :discountcode

  def setup
  end

  def discountcode
    return head :not_found unless current_user.teacher?

    application_status = CircuitPlaygroundDiscountApplication.application_status(current_user)
    render 'discountcode', locals: {script_data: application_status}
  end
end
