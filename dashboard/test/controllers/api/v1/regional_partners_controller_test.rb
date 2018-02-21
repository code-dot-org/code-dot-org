require 'test_helper'

class Api::V1::RegionalPartnersControllerTest < ActionController::TestCase
  COURSES = ['csd', 'csp']

  test 'index finds the regional partner for a normal district' do
    (COURSES + ['unselected']).each do |course|
      get :index, params: {school_district_id: '100002', course: course}
      response = JSON.parse(@response.body)
      assert_equal 'A+ College Ready', response['regional_partner']['name']
    end
  end

  test 'index finds the regional partner for a given district and course combination' do
    [
      ['csp', 'A+ College Ready'],
      ['csd', 'Academy for CS Education - Florida International University'],
    ].each do |course, regional_partner|
      get :index, params: {school_district_id: '1200390', course: course}
      response = JSON.parse(@response.body)
      assert_equal regional_partner, response['regional_partner']['name']
    end

    get :index, params: {school_district_id: '1200390', course: 'unselected'}
    response = JSON.parse(@response.body)
    assert_not_nil response['regional_partner']['name']
  end

  test 'index finds the regional partner and workshop days for a given district and course' do
    [
      ['csd', '200001', 'A+ College Ready', 'June 10-15, 2017'],
      ['csp', '200001', 'A+ College Ready', 'June 10-15, 2017'],
      ['unselected', '200001', 'A+ College Ready', 'June 10-15, 2017'],
      ['csd', '200003', 'A+ College Ready', 'June 16-20, 2017'],
      ['csp', '200003', 'A+ College Ready', 'June 16-20, 2017'],
      ['unselected', '200003', 'A+ College Ready', 'June 16-20, 2017'],
      ['csd', '600001', 'A+ College Ready', 'June 1-5, 2017'],
      ['csp', '600001', 'A+ College Ready', 'June 21-25, 2017'],
    ].each do |course, district, regional_partner, workshop_days|
      get :index, params: {school_district_id: district, course: course}
      response = JSON.parse(@response.body)
      assert_equal regional_partner, response['regional_partner']['name']
      assert_equal workshop_days, response['workshop_days']
    end
  end

  test 'for_user gets regional partners for user' do
    program_manager = create :teacher
    regional_partner_for_user = create :regional_partner, name: 'Regional Partner 1'
    regional_partner_for_user.program_manager = program_manager.id
    create :regional_partner, name: 'Other regional partner'

    sign_in program_manager

    get :for_user
    response = JSON.parse(@response.body)
    assert_equal [['Regional Partner 1', regional_partner_for_user.id.to_s]], response
  end

  test 'for_user gets all regional partners for workshop admin' do
    sign_in (create :workshop_admin)

    get :for_user
    response = JSON.parse(@response.body)
    assert_equal RegionalPartner.count, response.length
  end
end
