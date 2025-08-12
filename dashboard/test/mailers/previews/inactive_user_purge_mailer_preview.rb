class InactiveUserPurgeMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods

  def teacher_inactivity_soft_delete_warning_email
    teacher = build :teacher
    InactiveUserPurgeMailer.teacher_inactivity_soft_delete_warning_email(teacher)
  end
end
