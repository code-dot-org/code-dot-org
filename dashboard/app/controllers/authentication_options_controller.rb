class AuthenticationOptionsController < ApplicationController
  # POST /users/auth/:id/disconnect
  def disconnect
    unless current_user&.migrated?
      flash.alert = I18n.t('auth.migration_required')
      return redirect_to edit_user_registration_path
    end

    auth_option = current_user.authentication_options.find(params[:id])
    removed_options = options_to_disconnect(auth_option)
    disconnected = current_user.transaction do
      removed_options.each(&:destroy!)

      removed_primary = removed_options.find {|option| option.id == current_user.primary_contact_info_id}
      if removed_primary
        replacement = replacement_primary_contact_info(removed_primary)
        raise ActiveRecord::Rollback unless current_user.update(primary_contact_info: replacement)
      end
      true
    end

    if disconnected
      flash.notice = I18n.t('auth.disconnect_successful')
    else
      Observability::Errors.report(
        'Disconnecting an authentication option left the user invalid',
        context: {credential_type: auth_option.credential_type, errors: current_user.errors.full_messages}
      )
      flash.alert = I18n.t('auth.disconnect_failed')
    end
    redirect_to edit_user_registration_path
  end

  # For ClassLink and Clever the account page lists one row for all of a
  # user's records with that provider (see Queries::User::LinkedAccounts), so
  # disconnecting it removes every one. Removing only the listed record would
  # leave the user still signed up with the provider through a hidden one.
  private def options_to_disconnect(auth_option)
    return [auth_option] unless Queries::User::LinkedAccounts.versioned?(auth_option.credential_type)

    current_user.authentication_options.where(credential_type: auth_option.credential_type).to_a
  end

  # The option that takes over as primary_contact_info once removed_primary is
  # destroyed: the remaining option with the same email, else a new EMAIL
  # option that keeps the address on the account.
  #
  # Clever and ClassLink students have no email on record. For them that EMAIL
  # option would carry a blank authentication_id, which is unique per
  # credential type, so it clashes with the first one ever saved. Any remaining
  # option serves instead, and a student with none left keeps no
  # primary_contact_info, which the User model allows.
  private def replacement_primary_contact_info(removed_primary)
    remaining = current_user.authentication_options
    return remaining.order(:created_at, :id).first if removed_primary.hashed_email.blank?

    remaining.find_by(hashed_email: removed_primary.hashed_email) ||
      email_option_from_deleted_option(removed_primary)
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
