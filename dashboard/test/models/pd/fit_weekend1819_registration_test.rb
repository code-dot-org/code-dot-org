require 'test_helper'

class Pd::FitWeekend1819RegistrationTest < ActiveSupport::TestCase
  test 'required field validations' do
    registration = build(:pd_fit_weekend1819_registration, form_data: nil)
    refute registration.valid?
    assert_equal [
      "Form data is required",
    ], registration.errors.full_messages

    registration.form_data = {}.to_json
    refute registration.valid?
    assert_equal [
      "Form data preferredFirstName",
      "Form data lastName",
      "Form data email",
      "Form data phone",
      "Form data ableToAttend",
      "Form data contactFirstName",
      "Form data contactLastName",
      "Form data contactRelationship",
      "Form data contactPhone",
      "Form data dietaryNeeds",
      "Form data liveFarAway",
      "Form data howTraveling",
      "Form data needHotel",
      "Form data photoRelease",
      "Form data liabilityWaiver",
      "Form data agreeShareContact",
    ], registration.errors.full_messages

    registration.form_data = build(:pd_fit_weekend1819_registration_hash).to_json

    assert registration.valid?
  end

  test 'declined application requires fewer fields' do
    registration = create(:pd_fit_weekend1819_registration, status: :declined)

    assert registration.valid?
    refute registration.sanitize_form_data_hash.key?(:contact_first_name)
    refute registration.sanitize_form_data_hash.key?(:dietary_needs)
  end

  test 'declining the registration updates the application status' do
    {
      accepted: 'accepted_not_notified',
      declined: 'withdrawn'
    }.each do |registration_status, expected_application_status|
      application = create(:pd_teacher_application, :locked)

      create(:pd_fit_weekend1819_registration, pd_application: application, status: registration_status)
      assert_equal expected_application_status, application.reload.status
    end
  end
end
