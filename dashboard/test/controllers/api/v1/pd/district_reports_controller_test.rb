require 'test_helper'

class Api::V1::Pd::DistrictReportsControllerTest < ::ActionController::TestCase
  include Devise::TestHelpers

  test 'admins can view district report' do
    sign_in create(:admin)

    get :index
    assert_response :success
  end

  test 'non-admins cannot view district report' do
    # Including district contacts & workshop organizers
    contact = create :district_contact
    create :district, contact: contact
    sign_in contact
    get :index
    assert_response :forbidden
    sign_out contact

    organizer = create :workshop_organizer
    create :pd_workshop, organizer: organizer
    sign_in organizer
    get :index
    assert_response :forbidden
  end

end
