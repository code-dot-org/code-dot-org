require 'test_helper'

class Api::V1::Pd::WorkshopOrganizersControllerTest < ::ActionController::TestCase
  test_user_gets_response_for :index, response: :success, user: :workshop_admin

  [:teacher, :workshop_organizer].each do |user_type|
    test_user_gets_response_for :index, response: :forbidden, user: user_type
  end

  test 'results' do
    organizers = create_list :workshop_organizer, 2

    # extra users who are not organizers
    create :facilitator
    create :teacher

    sign_in (create :workshop_admin)
    get :index
    response = JSON.parse(@response.body)
    assert_equal 2, response.count
    organizers.each do |organizer|
      expected = {
        id: organizer.id,
        name: organizer.name,
        email: organizer.email
      }.stringify_keys
      assert_equal expected, response.find {|o| o['id'] == organizer.id}
    end
  end
end
