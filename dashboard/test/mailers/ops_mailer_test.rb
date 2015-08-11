require 'test_helper'

class OpsMailerTest < ActionMailer::TestCase
  test "district_contact_added_teachers" do
    @cohorts_district = create(:cohorts_district)
    @cohort = @cohorts_district.cohort
    @district = @cohorts_district.district

    teachers = [create(:teacher)]

    mail = OpsMailer.district_contact_added_teachers(@district.contact, @cohort, teachers, [])
    assert_equal "[ops notification]   modified Test Cohort", mail.subject
    assert_equal ["ops@code.org"], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert_match "added 1 teachers", mail.body.encoded
  end

end
