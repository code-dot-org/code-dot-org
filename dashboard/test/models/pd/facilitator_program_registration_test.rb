require 'test_helper'

class Pd::FacilitatorProgramRegistrationTest < ActiveSupport::TestCase
  test 'required field validations' do
    registration = Pd::FacilitatorProgramRegistration.new
    refute registration.valid?
    assert_equal [
      "User is required",
      "Form data is required",
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
      "Teachercon is not included in the list"
    ], registration.errors.full_messages

    registration.user = create :facilitator
    registration.teachercon = 1
    registration.form_data = build(:pd_facilitator_program_registration_hash).to_json

    assert registration.valid?
  end
end
