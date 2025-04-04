require 'test_helper'

class Services::User::PasswordCheckerTest < ActiveSupport::TestCase
  def setup
    @teacher = ::User.new(user_type: ::User::TYPE_TEACHER)
    @teacher.sign_up_country = 'AU'
    @student = ::User.new(user_type: ::User::TYPE_STUDENT)
    @teacher_saved = ::User.create!(user_type: ::User::TYPE_TEACHER, email: 'test@example.com')
  end
end
