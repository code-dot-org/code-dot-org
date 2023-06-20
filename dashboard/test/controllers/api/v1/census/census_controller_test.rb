require 'test_helper'
require 'census_helper'

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
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        opt_in: true
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
        country_s: "US",
        school_name_s:  "Brooklyn Heights",
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        opt_in: true
      }
    assert_response 201
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'HoC census submission uses current_census_year' do
    post :create,
      params: {
        form_version: 'CensusHoc2017v3',
        nces_school_s: '60000113717',
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        opt_in: true
      }
    assert_response 201
    response = JSON.parse(@response.body)
    submission_id = response['census_submission_id']
    submission = Census::CensusSubmission.find(submission_id)
    refute submission.nil?
    assert_equal current_census_year, submission.school_year
  end

  test 'yourschool census submission at start of new census year uses new school_year' do
    time = Date.new(2023, 7, 1)

    Timecop.freeze(time) do
      post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '60000113717',
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }
      assert_response 201, @response.body.to_s
      response = JSON.parse(@response.body)
      submission_id = response['census_submission_id']
      submission = Census::CensusSubmission.find(submission_id)
      refute submission.nil?
      assert_equal time.year, submission.school_year
    end
  end

  test 'yourschool census submission at end of previous census year uses previous school_year' do
    time = Date.new(2023, 6, 30)

    Timecop.freeze(time) do
      post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '60000113717',
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }
      assert_response 201, @response.body.to_s
      response = JSON.parse(@response.body)
      submission_id = response['census_submission_id']
      submission = Census::CensusSubmission.find(submission_id)
      refute submission.nil?
      assert_equal (time.year - 1), submission.school_year
    end
  end

  test 'yourschool census submission with good school succeeds' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '60000113717',
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'yourschool census submission with negative 1 school_name succeeds' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '-1',
        country_s: "US",
        school_name_s: "Philly High",
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'yourschool census submission with negative 1 school_name, existing school_id succeeds' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '-1',
        country_s: "US",
        school_name_s: "Rushmore",
        submitter_email_address: "rushmore@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }

    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '-1',
        country_s: "US",
        school_name_s: "Rushmore",
        submitter_email_address: "rushmore@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'yourschool census submission with negative 1 school_id fails' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '-1',
        country_s: "US",
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        opt_in: true
      }
    assert_response 400
    response = JSON.parse(@response.body)
    assert_includes response["school_name"], "cannot be blank"
  end

  test 'teacher banner census submission succeeds' do
    post :create,
      params: {
        form_version: 'CensusTeacherBannerV1',
        nces_school_s: '60000113717',
        submitter_email_address: "fake@email.address",
        submitter_name: "Somebody",
        submitter_role: 'TEACHER',
        how_many_20_hours: 'SOME',
        opt_in: true
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    refute response['census_submission_id'].nil?, "census_submission_id expected in response: #{response}"
  end

  test 'utf8mb4 characters are stripped out' do
    post :create,
      params: {
        form_version: 'CensusYourSchool2017v4',
        nces_school_s: '60000113717',
        submitter_email_address: "fake\u{1F600}@email.address",
        submitter_name: "Somebody\u{1F600}",
        submitter_role: 'OTHER',
        how_many_do_hoc: 'NONE',
        how_many_after_school: 'NONE',
        how_many_10_hours: 'NONE',
        how_many_20_hours: 'NONE',
        topic_other_description: "\u{1F600}description\u{1F600}",
        tell_us_more: "\u{1F600}more\u{1F600}",
        opt_in: true,
      }
    assert_response 201, @response.body.to_s
    response = JSON.parse(@response.body)
    submission_id = response['census_submission_id']
    refute submission_id.nil?, "census_submission_id expected in response: #{response}"
    submission = Census::CensusSubmission.find(submission_id)
    refute submission.nil?
    assert_equal "fake@email.address", submission.submitter_email_address
    assert_equal "Somebody", submission.submitter_name
    assert_equal "description", submission.topic_other_description
    assert_equal "more", submission.tell_us_more
  end
end
