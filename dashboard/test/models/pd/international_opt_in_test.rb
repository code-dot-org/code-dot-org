require 'test_helper'

class Pd::InternationalOptInTest < ActiveSupport::TestCase
  FORM_DATA = {
    firstName: 'First',
    firstNamePreferred: 'Preferred',
    lastName: 'Last',
    email: 'foo@bar.com',
    schoolName: 'School Name',
    schoolCity: 'School City',
    schoolCountry: 'School Country',
    date: '2019-02-18',
    workshopOrganizer: 'Workshop Organizer',
    workshopCourse: 'Workshop Course',
    emailOptIn: 'Yes',
    legalOptIn: true
  }

  test 'Test international opt-in validation' do
    teacher = create :teacher

    refute build(:pd_international_opt_in, form_data: {}.to_json, user_id: teacher.id).valid?

    refute build(
      :pd_international_opt_in, form_data: FORM_DATA.merge({schoolName: nil}).to_json, user_id: teacher.id
    ).valid?

    assert build(:pd_international_opt_in, form_data: FORM_DATA.to_json, user_id: teacher.id).valid?

    refute build(:pd_international_opt_in, form_data: FORM_DATA.to_json).valid?
  end

  test 'Requires workshop date' do
    teacher = create :teacher

    missing_date = build :pd_international_opt_in,
      user_id: teacher.id,
      form_data: FORM_DATA.merge({date: nil}).to_json
    refute missing_date.valid?

    malformed_date = build :pd_international_opt_in,
      user_id: teacher.id,
      form_data: FORM_DATA.merge({date: 'malformed-date'}).to_json
    refute malformed_date.valid?

    valid_date = build :pd_international_opt_in,
      user_id: teacher.id, form_data:
        FORM_DATA.merge({date: '2019-02-18'}).to_json
    assert valid_date.valid?
  end
end
