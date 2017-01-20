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
end
