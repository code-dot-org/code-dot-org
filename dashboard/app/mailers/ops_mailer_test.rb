require 'test_helper'

class OpsTest < ActionMailer::TestCase
  test "district_contact_added_teachers" do
    mail = Ops.district_contact_added_teachers
    assert_equal "District contact added teachers", mail.subject
    assert_equal ["to@example.org"], mail.to
    assert_equal ["from@example.com"], mail.from
    assert_match "Hi", mail.body.encoded
  end

end
