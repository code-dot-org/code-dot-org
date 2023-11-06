# This can be viewed on non-production environments at /rails/mailers/teacher_mailer
class TeacherMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods

  def new_teacher_email_es_mx_preview
    teacher = build :teacher, email: 'teacher@gmail.com'
    TeacherMailer.new_teacher_email(teacher, 'es-MX')
  end

  def new_teacher_email_preview
    teacher = build :teacher, email: 'fake_email@fake.com'
    TeacherMailer.new_teacher_email(teacher)
  end

  def hour_of_code_tutorial_preview
    teacher = build :teacher, email: 'newteacher@fake.com'
    lesson = create :lesson
    lesson_plan_html_url = lesson&.lesson_plan_html_url
    TeacherMailer.hoc_tutorial_email(teacher, lesson_plan_html_url)
  end
end
