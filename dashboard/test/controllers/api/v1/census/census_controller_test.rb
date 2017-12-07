require 'test_helper'

class Api::V1::Census::CensusControllerTest < ActionController::TestCase
  test 'census submission with bad version fails' do
    post :create,  params: {form_version: 'bogus'}
    assert_response 400
    response = JSON.parse(@response.body)
    refute response['form_version'].nil?, "form_version expected in errors: #{response}"
  end

  test 'census submission with bad school fails' do
    post :create,
      params: {
        form_version: 'anything',
        nces_school_s: '00000044'
      }
    assert_response 400
    response = JSON.parse(@response.body)
    refute response['nces_school_s'].nil?, "nces_school_s expected in errors: #{response}"
  end

  test 'HoC census submission with good school succeeds' do
    post :create,
      params: {
        form_version: 'CensusHoc2017v3',
        nces_school_s: '60000113717',
        school_year: 2017,
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody"
      }
    assert_response 201
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'HoC census submission with negative 1 school_id succeeds' do
    post :create,
      params: {
        form_version: 'CensusHoc2017v3',
        nces_school_s: '-1',
        school_year: 2017,
        country_s: "US",
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody"
      }
    assert_response 201
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'yourschool census submission with good school succeeds' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '60000113717',
        school_year: 2017,
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE'
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'yourschool census submission with negative 1 school_id succeeds' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '-1',
        school_year: 2017,
        country_s: "US",
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE'
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'teacher banner census submission succeeds' do
    post :create,
      params: {
        form_version: 'CensusTeacherBannerV1',
        nces_school_s: '60000113717',
        school_year: 2017,
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'TEACHER',
        how_many_20_hours: 'SOME'
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end
end
