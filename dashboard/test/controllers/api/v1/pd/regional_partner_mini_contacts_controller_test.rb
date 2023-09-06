require 'test_helper'

class Api::V1::Pd::RegionalPartnerMiniContactsControllerTest < ActionDispatch::IntegrationTest
  test 'can create a new regional partner mini contact' do
    # Use the same state & zip as the mini-contact factory's defaults.
    state = 'OH'
    zip = '45242'

    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: state)
    regional_partner.mappings.find_or_create_by!(zip_code: zip)

    assert_valid_form build(:pd_regional_partner_mini_contact_hash)
  end

  test 'create returns error if email is missing' do
    form_data = build(:pd_regional_partner_mini_contact_hash).
                merge("email" => "")
    refute_valid_form(form_data)
    response_body = JSON.parse(response.body)
    assert_equal ['email'], response_body['errors']['form_data']
  end

  test 'create returns error if zip is missing' do
    form_data = build(:pd_regional_partner_mini_contact_hash).
                merge("zip" => "")
    refute_valid_form(form_data)
    response_body = JSON.parse(response.body)
    assert_equal ['zip'], response_body['errors']['form_data']
  end

  private def assert_valid_form(form_data)
    assert_creates Pd::RegionalPartnerMiniContact do
      post '/api/v1/pd/regional_partner_mini_contacts',
        as: :json,
        params: {form_data: form_data}
    end
    assert_response :created
  end

  private def refute_valid_form(form_data)
    assert_does_not_create Pd::RegionalPartnerMiniContact do
      post '/api/v1/pd/regional_partner_mini_contacts',
        as: :json,
        params: {form_data: form_data}
    end
    assert_response :bad_request
  end
end
