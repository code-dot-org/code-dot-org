require 'test_helper'

class Api::V1::Pd::PreWorkshopSurveysControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop = create :pd_workshop
  end

  test_redirect_to_sign_in_for :show, params: -> {{pd_workshop_id: @workshop.id}}

  test_user_gets_response_for(
    :show,
    user: -> {@workshop.organizer},
    params: -> {{pd_workshop_id: @workshop.id}},
    response: :success
  )

  test_user_gets_response_for(
    :show,
    user: :workshop_organizer,
    params: -> {{pd_workshop_id: @workshop.id}},
    response: :forbidden
  )
end
