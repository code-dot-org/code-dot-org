require 'test_helper'

class Pd::Teachercon1819RegistrationTest < ActiveSupport::TestCase
  test 'required field validations' do
    registration = Pd::Teachercon1819Registration.new
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
      "Form data teacherAcceptSeat",
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

    registration.pd_application = create(:pd_teacher1819_application)
    registration.form_data = build(:pd_teachercon1819_registration_hash).to_json

    assert registration.valid?
  end

  test 'declined application requires fewer fields' do
    registration = create(:pd_teachercon1819_registration, accepted: false)

    assert registration.valid?
    refute registration.sanitize_form_data_hash.key?(:contact_first_name)
    refute registration.sanitize_form_data_hash.key?(:dietary_needs)
  end
end
