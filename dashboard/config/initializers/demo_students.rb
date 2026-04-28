# Prevent configured demo student accounts from logging in.
# This is run on boot. The id list is loaded from per-env config
# and only takes effect on restart.
Rails.application.config.after_initialize do
  next if Rails.env.test?

  begin
    DemoStudents.prevent_demo_student_logins
  rescue StandardError => exception
    Honeybadger.notify(exception, context: {message: 'Failed to lock down demo students on boot'})
  end
end
