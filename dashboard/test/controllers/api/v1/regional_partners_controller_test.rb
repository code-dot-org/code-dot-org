require 'test_helper'

class Api::V1::RegionalPartnersControllerTest < ActionController::TestCase
  COURSES = ['csd', 'csp']

  test 'index gets regional partners for user' do
    program_manager = create :teacher

    regional_partner_for_user = create :regional_partner, name: 'Regional Partner'
    regional_partner_for_user.program_manager = program_manager.id

    another_regional_partner_for_user = create :regional_partner, name: 'Another Regional Partner'
    another_regional_partner_for_user.program_manager = program_manager.id

    create :regional_partner, name: 'Other regional partner'

    sign_in program_manager

    get :index
    response = JSON.parse(@response.body)
    assert_equal [
      {'name' => 'Another Regional Partner', 'id' => another_regional_partner_for_user.id},
      {'name' => 'Regional Partner', 'id' => regional_partner_for_user.id}
    ], response
  end

  test 'index gets all regional partners for workshop admin' do
    regional_partner = create :regional_partner, name: 'New regional partner'
    sign_in (create :workshop_admin)

    get :index
    response = JSON.parse(@response.body)
    assert_equal RegionalPartner.count, response.length
    assert response.include?({'id' => regional_partner.id, 'name' => regional_partner.name})
  end
end
