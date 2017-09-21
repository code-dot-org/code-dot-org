require 'test_helper'

class Api::V1::SchoolsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  ALBERT_EINSTEIN_ACADEMY_ELEMENTARY = {
    id: 60000113717,
    name: 'Albert Einstein Academy Elementary',
    city: 'Santa Clarita',
    state: 'CA',
    zip: '91355',
    school_district_id: 600001
  }.deep_stringify_keys.freeze

  GLADYS_JUNG_ELEMENTARY = {
    id: 20000100207,
    name: 'Gladys Jung Elementary',
    city:'Bethel',
    state: 'AK',
    zip: '99559',
    school_district_id: 200001
  }.deep_stringify_keys.freeze

  test 'search by school name prefix' do
    get :search, params: {q: 'glad', limit: 40}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    check_school GLADYS_JUNG_ELEMENTARY, response[0]
  end

  test 'search by school name substring' do
    get :search, params: {q: 'jung', limit: 40}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    check_school GLADYS_JUNG_ELEMENTARY, response[0]
  end

  test 'search by school name suffix' do
    get :search, params: {q: 'tary', limit: 40}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 2, response.length
    check_school ALBERT_EINSTEIN_ACADEMY_ELEMENTARY, response[0]
    check_school GLADYS_JUNG_ELEMENTARY, response[1]
  end

  test 'search by school city prefix' do
    get :search, params: {q: 'beth', limit: 40}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    check_school GLADYS_JUNG_ELEMENTARY, response[0]
  end

  test 'search by school zip' do
    get :search, params: {q: '99559', limit: 40}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    check_school GLADYS_JUNG_ELEMENTARY, response[0]
  end

  test 'search with limit of negative one' do
    assert_raise ArgumentError do
      get :search, params: {q: 'glad', limit: -1}
    end
  end

  test 'search with limit of zero' do
    get :search, params: {q: 'glad', limit: 0}
    assert_response :success
    assert_equal '[]', @response.body
  end

  def check_school(expect, actual)
    expect.keys.each do |k|
      assert_equal expect[k], actual[k]
    end
  end
end
