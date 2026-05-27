class LevelbuilderMailer < ApplicationMailer
  default from: 'noreply@code.org'

  def unit_copy_completed(user, new_unit_name)
    @user = user
    @new_unit_name = new_unit_name
    @edit_url = CDO.studio_url("s/#{new_unit_name}/edit", 'https')
    mail to: user.email, subject: "Unit copy complete: #{new_unit_name}"
  end

  def unit_copy_failed(user, source_unit_name, error_message)
    @user = user
    @source_unit_name = source_unit_name
    @error_message = error_message
    mail to: user.email, subject: "Unit copy failed: #{source_unit_name}"
  end
end
