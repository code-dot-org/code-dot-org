module User::UserType
  extend ActiveSupport::Concern

  def student_2?
    user_type == self.class::TYPE_STUDENT
  end

  def teacher_2?
    user_type == self.class::TYPE_TEACHER
  end
end
