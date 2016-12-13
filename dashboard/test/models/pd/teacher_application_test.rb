require 'test_helper'

class Pd::TeacherApplicationTest < ActiveSupport::TestCase
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
end
