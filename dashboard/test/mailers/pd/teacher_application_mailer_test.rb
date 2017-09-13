require 'test_helper'

class TeacherApplicationMailerTest < ActionMailer::TestCase
  test 'application receipt links are valid urls' do
    application = create :pd_teacher_application
    email = Pd::TeacherApplicationMailer.application_receipt(application)

    assert links_are_complete_urls?(email)
  end

  test 'principal approval receipt links are valid urls' do
    application = create :pd_teacher_application
    email = Pd::TeacherApplicationMailer.principal_approval_receipt(application)

    assert links_are_complete_urls?(email)
  end

  test 'principal approval request links are valid urls' do
    application = create :pd_teacher_application
    School.expects(find: build(:public_school, name: 'Hogwarts School of Witchcraft & Wizardry'))
    email = Pd::TeacherApplicationMailer.principal_approval_request(application)

    assert links_are_complete_urls?(email)
  end
end
