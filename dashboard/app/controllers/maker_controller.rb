class MakerController < ApplicationController
  before_action :authenticate_user!, only: :discountcode

  def setup
  end

  def discountcode
    script_data = {
      is_pd_eligible: CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(current_user),
      is_progress_eligible: CircuitPlaygroundDiscountApplication.student_progress_eligible?(current_user),
      # This will be a number from 1-5 (representing which radio button) was selected,
      # or nil if no selection yet
      unit_6_intention: nil,
      has_submitted_school: false,
      # true/false once has_submitted_school is true
      gets_full_discount: nil,
      discount_code: nil,
    }
    render 'discountcode', locals: {script_data: script_data}
  end
end
