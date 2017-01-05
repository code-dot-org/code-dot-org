require 'test_helper'

class Api::V1::RegionalPartnersControllerTest < ActionController::TestCase
  COURSES = ['csd', 'csp']

  test 'index finds the regional partner for a normal district' do
    COURSES.each do |course|
      get :index, params: {school_district_id: '100002', course: course}
      response = JSON.parse(@response.body)
      assert_equal 'A+ College Ready', response['name']
      assert_equal 1, response['group']
    end
  end

  test 'index finds the regional partner for an overriden district for csp' do
    get :index, params: {school_district_id: '1200390', course: 'csp'}
    response = JSON.parse(@response.body)
    assert_equal 'Academy for CS Education - Florida International University', response['name']
    assert_equal 2, response['group']
  end

  test 'index finds the overridden regional partner for an overriden district for csd' do
    get :index, params: {school_district_id: '1200390', course: 'csd'}
    response = JSON.parse(@response.body)
    assert_equal 'Broward County Public Schools', response['name']
    assert_equal 1, response['group']
  end
end
