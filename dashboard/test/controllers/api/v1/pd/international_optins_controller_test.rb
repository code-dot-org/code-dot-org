require 'test_helper'

class Api::V1::Pd::RegionalPartnerContactsControllerTest < ::ActionController::TestCase
  SAMPLE_FORM_DATA = {
    firstName: 'First',
    firstNamePreferred: 'Preferred',
    lastName: 'Last',
    email: 'foo@bar.com',
    emailAlternate: 'footoo@bar.com',
    gender: 'Prefer not to answer',
    schoolName: 'School Name',
    schoolCity: 'School City',
    schoolCountry: 'School Country',
    ages: ['19+ years old'],
    subjects: ['ICT'],
    resources: ['Kodable'],
    robotics: ['LEGO Education'],
    workshopOrganizer: 'Workshop Organizer',
    workshopFacilitator: 'Workshop Facilitator',
    workshopCourse: 'Workshop Course',
    optIn: 'Yes'
  }

  test 'create creates a new international optin' do
    assert_creates Pd::InternationalOptin do
      put :create, params: {
        form_data: SAMPLE_FORM_DATA
      }
    end

    assert_response :created
  end

  test 'create returns appropriate errors if international optin data is missing' do
    new_form = SAMPLE_FORM_DATA.dup
    new_form.delete :lastName

    assert_does_not_create Pd::InternationalOptin do
      put :create, params: {
        form_data: new_form
      }
    end

    assert_response :bad_request
    response_body = JSON.parse(@response.body)

    assert_equal 'Please fill out the fields about your school above', response_body['general_error']
  end
end
