require 'test_helper'

class Api::V1::Pd::RegionalPartnerContactsControllerTest < ::ActionController::TestCase
  SAMPLE_FORM_DATA = {
    first_name: 'Harry',
    last_name: 'Potter',
    title: 'Mr.',
    email: 'potter@hogwarts.edu',
    role: 'Teacher',
    job_title: 'Defense against dark arts',
    grade_levels: ['High School'],
    school_type: 'public',
    school_state: 'NY',
    school_district_other: true,
    school_district_name: 'Hogwarts',
    opt_in: 'Yes'
  }

  test 'create creates a new regional partner contact' do
    assert_creates Pd::RegionalPartnerContact do
      put :create, params: {
        form_data: SAMPLE_FORM_DATA
      }
    end

    assert_response :created
  end

  test 'create returns appropriate errors if school district data is missing' do
    new_form = SAMPLE_FORM_DATA.dup
    new_form.delete :school_district_name

    assert_does_not_create Pd::RegionalPartnerContact do
      put :create, params: {
        form_data: new_form
      }
    end

    assert_response :bad_request
    response_body = JSON.parse(@response.body)

    assert_equal 'Please fill out the fields about your school above', response_body['general_error']
  end
end
