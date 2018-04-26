require 'test_helper'

class Api::V1::SchoolsControllerTest < ActionController::TestCase
  ALBERT_EINSTEIN_ACADEMY_ELEMENTARY = {
    nces_id: '60000113717',
    school_type: 'charter',
    name: 'Albert Einstein Academy Elementary',
    city: 'Santa Clarita',
    state: 'CA',
    zip: '91355',
    latitude: "34.4375",
    longitude: "-118.576861"
  }.deep_stringify_keys.freeze

  GLADYS_JUNG_ELEMENTARY = {
    nces_id: '20000100207',
    school_type: 'public',
    name: 'Gladys Jung Elementary',
    city: 'Bethel',
    state: 'AK',
    zip: '99559',
    latitude: "60.80254",
    longitude: "-161.77072"
  }.deep_stringify_keys.freeze

  JOANN_A_ALEXIE_MEMORIAL_SCHOOL = {
    nces_id: '20000100206',
    school_type: 'public',
    name: 'Joann A. Alexie Memorial School',
    city: 'Atmautluak',
    state: 'AK',
    zip: '99559',
    latitude: "60.866944",
    longitude: "-162.273056"
  }.deep_stringify_keys.freeze

  QUALITY_EDUCATION_ACADEMY = {
    nces_id: '370002502096',
    name: 'Quality Education Academy',
    city: "Winston Salem",
    state: 'NC',
    zip: '27105',
    school_type: 'charter',
    latitude: "36.15115",
    longitude: "-80.21101",
  }.deep_stringify_keys.freeze

  CHILDRENS_VILLAGE = {
    nces_id: "530537003179",
    name: "Children's Village",
    city: "Moxee",
    state: "WA",
    zip: "98936",
    school_type: "public",
    latitude: "46.552088",
    longitude: "-120.381461"
  }.deep_stringify_keys.freeze

  test 'search by school name prefix' do
    get :search, params: {q: 'glad', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by short school name prefix' do
    get :search, params: {q: 'elementary ju', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by school name substring' do
    get :search, params: {q: 'jung', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by school city prefix' do
    get :search, params: {q: 'beth', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by school zip' do
    get :search, params: {q: '91355', limit: 40}
    assert_response :success
    assert_equal [ALBERT_EINSTEIN_ACADEMY_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by school zip with extended format' do
    get :search, params: {q: '91355-1234', limit: 40}
    assert_response :success
    assert_equal [ALBERT_EINSTEIN_ACADEMY_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search with limit of negative one' do
    get :search, params: {q: 'glad', limit: -1}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search with limit of zero' do
    get :search, params: {q: 'glad', limit: 0}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search with short string' do
    get :search, params: {q: 'JOANN A. ALEXIE', limit: 40}
    assert_response :success
    assert_equal [JOANN_A_ALEXIE_MEMORIAL_SCHOOL], JSON.parse(@response.body)
  end

  test 'search with hyphen' do
    get :search, params: {q: 'winston-salem', limit: 40}
    assert_response :success
    assert_equal [QUALITY_EDUCATION_ACADEMY], JSON.parse(@response.body)
  end

  test 'search with apostrophe' do
    get :search, params: {q: "children's village", limit: 40}
    assert_response :success
    assert_equal [CHILDRENS_VILLAGE], JSON.parse(@response.body)
  end

  test 'new search with apostrophe' do
    get :search, params: {q: "children's village", limit: 40, use_new_search: true}
    assert_response :success
    assert_equal [CHILDRENS_VILLAGE], JSON.parse(@response.body)
  end

  test 'new search with hyphen' do
    get :search, params: {q: 'winston-salem', limit: 40, use_new_search: true}
    assert_response :success
    assert_equal [QUALITY_EDUCATION_ACADEMY], JSON.parse(@response.body)
  end

  test 'new search with non-matching term' do
    get :search, params: {q: 'Albert Einstein Elementary OTHERTERM', limit: 40, use_new_search: true}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal ALBERT_EINSTEIN_ACADEMY_ELEMENTARY, response_body.first, response_body
  end

  test 'new search with zip and text term' do
    get :search, params: {q: 'Einstein 91355', limit: 40, use_new_search: true}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal ALBERT_EINSTEIN_ACADEMY_ELEMENTARY, response_body.first, response_body
  end

  test 'new search with name and city' do
    get :search, params: {q: 'Jung Bethel', limit: 40, use_new_search: true}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal GLADYS_JUNG_ELEMENTARY, response_body.first, response_body
  end

  test 'new search with name, zip, city, and non-matching term' do
    get :search, params: {q: 'Jung Bethel 99559 OTHERTERM', limit: 40, use_new_search: true}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal GLADYS_JUNG_ELEMENTARY, response_body.first, response_body
  end
end
