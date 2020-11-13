class AuthenticationOptionsController < ApplicationController
  # POST /users/auth/:id/disconnect
  def disconnect
    unless current_user&.migrated?
      flash.alert = I18n.t('auth.migration_required')
      return redirect_to edit_user_registration_path
    end

    auth_option = current_user.authentication_options.find(params[:id])
    if auth_option.present?
      current_user.transaction do
        auth_option.destroy!
        flash.notice = I18n.t('auth.disconnect_successful')

        # Replace primary_contact_info if we just destroyed it
        if current_user.primary_contact_info_id == auth_option.id
          replacement = current_user.authentication_options.find_by hashed_email: auth_option.hashed_email
          replacement ||= email_option_from_deleted_option auth_option
          current_user.update! primary_contact_info: replacement
        end
      end
    end

    redirect_to edit_user_registration_path
  end

  private def email_option_from_deleted_option(deleted_option)
    AuthenticationOption.new(
      user: deleted_option.user,
      email: deleted_option.email,
      hashed_email: deleted_option.hashed_email,
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: deleted_option.hashed_email
    )
  end
end
