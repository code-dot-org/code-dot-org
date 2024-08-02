# This can be viewed on non-production environments at /rails/mailers/teacher_mailer
class TeacherMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods

  def hour_of_code_tutorial_preview
    teacher_name = 'Severus Snape'
    teacher_email = 'newteacher@fake.com'
    # 'oceans' course offering was chosen arbitrarily
    lessons = CourseOffering.find_by(key: 'oceans')&.latest_published_version('en-us')&.units&.first&.lessons
    lesson_plan_html_url = lessons&.first&.lesson_plan_html_url
    TeacherMailer.hoc_tutorial_email(teacher_name, teacher_email, lesson_plan_html_url)
  end
end
