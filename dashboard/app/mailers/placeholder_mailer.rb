# This is a placeholder mailer initially used to test out active job.
# Once we are using active job for real features we can delete this file.

class PlaceholderMailer < ApplicationMailer
  def placeholder_email(user)
    mail to: user.email, from: 'noreply@code.org', subject: 'Placeholder Email'
  end
end
