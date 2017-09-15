require 'test_helper'

class TeacherApplicationMailerTest < ActionMailer::TestCase
  test 'application receipt links are valid urls' do
    application = create :pd_teacher_application
    mail = Pd::TeacherApplicationMailer.application_receipt(application)

    assert links_are_complete_urls?(mail)
  end

  test 'principal approval receipt links are valid urls' do
    application = create :pd_teacher_application
    mail = Pd::TeacherApplicationMailer.principal_approval_receipt(application)

    assert links_are_complete_urls?(mail)
  end

  test 'principal approval request csd links are valid urls' do
    application = create :pd_teacher_application
    School.expects(find: build(:public_school, name: 'Hogwarts School of Witchcraft & Wizardry'))
    mail = Pd::TeacherApplicationMailer.principal_approval_request(application)

    assert links_are_complete_urls?(mail)
  end

  test 'principal approval request csp links are valid urls' do
    application_hash = build :pd_teacher_application_hash, course: 'csp'
    application = build :pd_teacher_application, application_hash: application_hash, id: 123
    School.expects(find: build(:public_school, name: 'Hogwarts School of Witchcraft & Wizardry'))
    mail = Pd::TeacherApplicationMailer.principal_approval_request(application)

    assert links_are_complete_urls?(mail)
  end
end
