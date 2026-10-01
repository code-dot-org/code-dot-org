class AuthenticationOptionsController < ApplicationController
  # POST /users/auth/:id/disconnect
  def disconnect
    unless current_user&.migrated?
      flash.alert = I18n.t('auth.migration_required')
      return redirect_to edit_user_registration_path
    end

    auth_option = current_user.authentication_options.find(params[:id])
    if auth_option.present?
      removed_options = options_to_disconnect(auth_option)
      current_user.transaction do
        removed_options.each(&:destroy!)
        flash.notice = I18n.t('auth.disconnect_successful')

        # Replace primary_contact_info if we just destroyed it
        removed_primary = removed_options.find {|option| option.id == current_user.primary_contact_info_id}
        if removed_primary
          replacement = current_user.authentication_options.find_by hashed_email: removed_primary.hashed_email
          replacement ||= email_option_from_deleted_option removed_primary
          current_user.update! primary_contact_info: replacement
        end
      end
    end

    redirect_to edit_user_registration_path
  end

  # The account page lists one ClassLink row for all of a user's ClassLink
  # records (see Queries::User::LinkedAccounts), so disconnecting it removes
  # every one. Removing only the listed record would leave the user still
  # signed up with ClassLink through the hidden one.
  private def options_to_disconnect(auth_option)
    return [auth_option] unless auth_option.credential_type == AuthenticationOption::CLASSLINK

    current_user.authentication_options.where(credential_type: AuthenticationOption::CLASSLINK).to_a
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
