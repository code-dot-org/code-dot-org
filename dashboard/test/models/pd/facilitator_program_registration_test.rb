require 'test_helper'

class Pd::FacilitatorProgramRegistrationTest < ActiveSupport::TestCase
  test 'required field validations' do
    registration = Pd::FacilitatorProgramRegistration.new
    refute registration.valid?
    assert_equal [
      "Form data is required",
      "User is required",
      "Teachercon is not included in the list"
    ], registration.errors.full_messages

    registration.form_data = {}.to_json
    refute registration.valid?
    assert_equal [
      "Form data addressStreet",
      "Form data addressCity",
      "Form data addressState",
      "Form data addressZip",
      "Form data contactName",
      "Form data contactRelationship",
      "Form data contactPhone",
      "Form data dietaryNeeds",
      "Form data liveFarAway",
      "Form data howTraveling",
      "Form data needHotel",
      "Form data needAda",
      "Form data photoRelease",
      "Form data liabilityWaiver",
      "Form data gender",
      "Form data race",
      "Form data age",
      "Form data gradesTaught",
      "Form data gradesPlanningToTeach",
      "Form data subjectsTaught",
      "User is required",
      "Teachercon is not included in the list"
    ], registration.errors.full_messages

    registration.user = create :facilitator
    registration.teachercon = 1
    registration.form_data = build(:pd_facilitator_program_registration_hash).to_json

    assert registration.valid?
  end

  test 'required fields are optional for deleted users' do
    registration = create :pd_facilitator_program_registration
    registration.user.destroy!
    registration.clear_form_data
    assert registration.valid?
  end
end
