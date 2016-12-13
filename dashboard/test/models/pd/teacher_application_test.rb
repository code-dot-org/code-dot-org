require 'test_helper'

class Pd::TeacherApplicationTest < ActiveSupport::TestCase
  test 'required field validations' do
    teacher_application = Pd::TeacherApplication.new
    refute teacher_application.valid?
    assert_equal [
      'User is required',
      'Primary email is required',
      'Secondary email is required',
      'Application is required'
    ], teacher_application.errors.full_messages

    teacher_application.user = create :teacher
    teacher_application.primary_email = 'teacher@example.net'
    teacher_application.secondary_email = 'teacher@my.school.edu'
    teacher_application.application = {}

    assert teacher_application.valid?
  end

  test 'teacher validation' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_teacher_application, user: create(:student)
    end
    assert_equal 'Validation failed: User must be a teacher', e.message
  end

  test 'user unique constraint' do
    teacher = create :teacher
    create :pd_teacher_application, user: teacher

    # The same user cannot create another application.
    assert_raises ActiveRecord::RecordNotUnique do
      create :pd_teacher_application, user: teacher
    end

    # Other users can add applications.
    create :pd_teacher_application
  end

  test 'email format validation' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_teacher_application, primary_email: 'invalid@ example.net'
    end
    assert_equal 'Validation failed: Primary email does not appear to be a valid e-mail address', e.message

    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_teacher_application, secondary_email: 'invalid@ example.net'
    end
    assert_equal 'Validation failed: Secondary email does not appear to be a valid e-mail address', e.message
  end
end
