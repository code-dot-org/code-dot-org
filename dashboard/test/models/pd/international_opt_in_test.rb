require 'test_helper'

class Pd::InternationalOptInTest < ActiveSupport::TestCase
  FORM_DATA = {
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
    emailOptIn: 'Yes',
    legalOptIn: true
  }

  test 'Test international opt-in validation' do
    teacher = create :teacher

    refute build(:pd_international_opt_in, form_data: {}.to_json, user_id: teacher.id).valid?

    refute build(
      :pd_international_opt_in, form_data: FORM_DATA.merge({ages: nil}).to_json, user_id: teacher.id
    ).valid?

    assert build(:pd_international_opt_in, form_data: FORM_DATA.to_json, user_id: teacher.id).valid?

    refute build(:pd_international_opt_in, form_data: FORM_DATA.to_json).valid?
  end
end
