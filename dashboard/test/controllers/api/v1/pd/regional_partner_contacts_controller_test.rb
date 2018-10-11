require 'test_helper'

class Api::V1::Pd::RegionalPartnerContactsControllerTest < ActionDispatch::IntegrationTest
  test 'school type is required' do
    refute_valid_form FOUND_DISTRICT_ONLY.merge("school-type" => "")
  end

  test 'school state is required' do
    refute_valid_form FOUND_DISTRICT_ONLY.merge("school-state" => "")
  end

  test 'school district is required' do
    refute_valid_form FOUND_DISTRICT_ONLY.merge("school-district" => "")
  end

  test 'can create a new regional partner contact with found district and no school' do
    assert_valid_form FOUND_DISTRICT_ONLY
  end

  test 'can create a new regional partner contact with found district and school' do
    assert_valid_form FOUND_DISTRICT_AND_SCHOOL
  end

  test 'can create a new regional partner contact with found district and other school' do
    assert_valid_form FOUND_DISTRICT_OTHER_SCHOOL
  end

  test 'zip code is required for found district and other school' do
    refute_valid_form FOUND_DISTRICT_OTHER_SCHOOL.merge("school-zipcode" => "")
  end

  test 'can create a new regional partner contact with other district and no school' do
    assert_valid_form OTHER_DISTRICT_ONLY
  end

  test 'district name is required for other district' do
    refute_valid_form OTHER_DISTRICT_ONLY.merge("school-district-name" => "")
  end

  test 'can create a new regional partner contact with other district and school' do
    assert_valid_form OTHER_DISTRICT_AND_SCHOOL
  end

  test 'zip code is required for other district and school' do
    refute_valid_form OTHER_DISTRICT_AND_SCHOOL.merge("school-zipcode" => "")
  end

  test 'can create a new regional partner contact with private school' do
    assert_valid_form PRIVATE_SCHOOL
  end

  test 'school name is required for private school' do
    refute_valid_form PRIVATE_SCHOOL.merge("school-name" => "")
  end

  test 'zip code is required for private school' do
    refute_valid_form PRIVATE_SCHOOL.merge("school-zipcode" => "")
  end

  test 'create returns appropriate errors if school district data is missing' do
    refute_valid_form OTHER_DISTRICT_AND_SCHOOL.merge("school-district-name" => "")
    assert_general_error 'Please fill out the fields about your school above'
  end

  private def assert_valid_form(form_data)
    assert_creates Pd::RegionalPartnerContact do
      post '/api/v1/pd/regional_partner_contacts',
        as: :json,
        params: {form_data: form_data}
    end
    assert_response :created
  end

  private def refute_valid_form(form_data)
    assert_does_not_create Pd::RegionalPartnerContact do
      post '/api/v1/pd/regional_partner_contacts',
        as: :json,
        params: {form_data: form_data}
    end
    assert_response :bad_request
  end

  private def assert_general_error(expected_message)
    response_body = JSON.parse(response.body)
    assert_equal expected_message, response_body['general_error']
  end

  # Sample data generated by submitting the actual form 2018-10-12.

  FOUND_DISTRICT_ONLY = {
    "firstName" => "Sybill",
    "lastName" => "Trelawney",
    "email" => "trelawney@example.com",
    "role" => "Teacher",
    "gradeLevels" => ["High School (9-12)"],
    "notes" => "A question for my regional partner",
    "optIn" => "No",
    "school-type" => "public",
    "school-state" => "OR",
    "school-district" => "5000000",
    "school-district-other" => false,
    "school" => "",
    "school-other" => false,
    "school-district-name" => "",
    "school-name" => "",
    "school-zipcode" => ""
  }

  FOUND_DISTRICT_AND_SCHOOL = {
    "firstName" => "Minerva",
    "lastName" => "McGonigall",
    "email" => "mcgonigall@example.com",
    "role" => "Teacher",
    "gradeLevels" => ["High School (9-12)"],
    "notes" => "A question for my regional partner",
    "optIn" => "No",
    "school-type" => "public",
    "school-state" => "OR",
    "school-district" => "5000000",
    "school-district-other" => false,
    "school" => "500000000000",
    "school-other" => false,
    "school-district-name" => "",
    "school-name" => "",
    "school-zipcode" => ""
  }

  FOUND_DISTRICT_OTHER_SCHOOL = {
    "firstName" => "Albus",
    "lastName" => "Dumbledore",
    "email" => "dumbledore@example.com",
    "role" => "School Administrator",
    "jobTitle" => "Headmaster",
    "gradeLevels" => ["High School (9-12)", "Middle School (6-8)", "Elementary School (K-5)"],
    "notes" => "A question for my regional partner",
    "optIn" => "No",
    "school-type" => "public",
    "school-state" => "OR",
    "school-district" => "5000000",
    "school-district-other" => false,
    "school" => "",
    "school-other" => true,
    "school-district-name" => "",
    "school-name" => "Hogwarts",
    "school-zipcode" => "99999"
  }

  OTHER_DISTRICT_ONLY = {
    "firstName" => "Filius",
    "lastName" => "Flitwick",
    "email" => "flitwick@example.com",
    "role" => "Teacher",
    "gradeLevels" => ["High School (9-12)"],
    "notes" => "A question for my regional partner",
    "optIn" => "No",
    "school-type" => "public",
    "school-state" => "OR",
    "school-district" => "",
    "school-district-other" => true,
    "school" => "",
    "school-other" => false,
    "school-district-name" => "The Wizarding Schools",
    "school-name" => "",
    "school-zipcode" => ""
  }

  OTHER_DISTRICT_AND_SCHOOL = {
    "firstName" => "Severus",
    "lastName" => "Snape",
    "email" => "snape@example.com",
    "role" => "District Administrator",
    "gradeLevels" => ["Elementary School (K-5)", "Middle School (6-8)"],
    "jobTitle" => "Professor",
    "optIn" => "No",
    "notes" => "A question for my regional partner",
    "school-type" => "public",
    "school-state" => "OR",
    "school-district" => "",
    "school-district-other" => true,
    "school" => "",
    "school-other" => false,
    "school-district-name" => "The Wizarding Schools",
    "school-name" => "Hogwarts",
    "school-zipcode" => "99999"
  }

  PRIVATE_SCHOOL = {
    "firstName" => "Igor",
    "lastName" => "Karkaroff",
    "email" => "karkaroff@example.com",
    "role" => "School Administrator",
    "jobTitle" => "Headmaster",
    "gradeLevels" => ["High School (9-12)"],
    "optIn" => "No",
    "notes" => "A question for my regional partner",
    "school-type" => "private",
    "school-state" => "OR",
    "school-district" => "",
    "school-district-other" => false,
    "school" => "",
    "school-other" => false,
    "school-district-name" => "",
    "school-name" => "Durmstrang Institute",
    "school-zipcode" => "99999"
  }
end
