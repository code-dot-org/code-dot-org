require 'test_helper'

class Api::V1::Pd::RegionalPartnerContactsControllerTest < ActionDispatch::IntegrationTest
  test 'can create a new regional partner contact with found district and no school' do
    assert_valid_form build(:pd_regional_partner_contact_hash, :found_district_only)
  end

  test 'can create a new regional partner contact with found district and school' do
    assert_valid_form build(:pd_regional_partner_contact_hash, :found_district_and_school)
  end

  test 'can create a new regional partner contact with found district and other school' do
    assert_valid_form build(:pd_regional_partner_contact_hash, :found_district_other_school)
  end

  test 'can create a new regional partner contact with other district and no school' do
    assert_valid_form build(:pd_regional_partner_contact_hash, :other_district_only)
  end

  test 'can create a new regional partner contact with other district and school' do
    assert_valid_form build(:pd_regional_partner_contact_hash, :other_district_and_school)
  end

  test 'can create a new regional partner contact with private school' do
    assert_valid_form build(:pd_regional_partner_contact_hash, :private_school)
  end

  test 'create returns generic error if school or district data is missing' do
    form_data = build(:pd_regional_partner_contact_hash, :other_district_and_school).
      merge("school-district-name" => "")
    assert_does_not_create Pd::RegionalPartnerContact do
      post '/api/v1/pd/regional_partner_contacts',
        as: :json,
        params: {form_data: form_data}
    end
    assert_response :bad_request
    response_body = JSON.parse(response.body)
    assert_equal 'Please fill out the fields about your school above', response_body['general_error']
  end

  private def assert_valid_form(form_data)
    assert_creates Pd::RegionalPartnerContact do
      post '/api/v1/pd/regional_partner_contacts',
        as: :json,
        params: {form_data: form_data}
    end
    assert_response :created
  end
end
