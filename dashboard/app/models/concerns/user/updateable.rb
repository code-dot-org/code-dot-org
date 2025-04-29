module User::Updateable
  extend ActiveSupport::Concern

  def update_without_password(params, *options)
    if params[:races]
      self.races = params[:races].join ','
    end
    params.delete(:races)
    super
  end

  def update_with_password(params, *options)
    if encrypted_password.blank?
      params.delete(:current_password) # user does not have password so current password is irrelevant
      update(params, *options)
    else
      super
    end
  end

  def update_email_for(email:, provider: nil, uid: nil)
    if migrated?
      # Provider and uid are required to update email on AuthenticationOption for migrated user.
      return unless provider.present? && uid.present?
      auth_option = authentication_options.find_by(credential_type: provider, authentication_id: uid)
      auth_option&.update(email: email)
    else
      update(email: email)
    end
  end

  def update_primary_contact_info(new_email: nil, new_hashed_email: nil)
    new_hashed_email = new_email.present? ? User.hash_email(new_email) : new_hashed_email

    return false if new_email.nil? && new_hashed_email.nil?
    return false if teacher? && new_email.nil?

    # If an auth option already exists with this email, it becomes the primary.
    # Otherwise make a new one.
    existing_auth_option = authentication_options.find_by hashed_email: new_hashed_email
    new_primary = existing_auth_option || AuthenticationOption.new(
      user: self,
      credential_type: AuthenticationOption::EMAIL,
      hashed_email: new_hashed_email
    )
    # Whether it's an existing auth option or a new one, always want to set a cleartext email.
    new_primary.email = new_email

    # Even though it's implied, pushing the new option into the
    # authentication_options association now allows our validations to run
    # when we save the user and produce useful error messages when, for example,
    # the email is already taken.
    self.primary_contact_info = new_primary
    authentication_options << new_primary
    success = save

    if success
      # Remove any email authentication options that the user isn't using, since
      # we don't surface them in the UI.
      authentication_options.
        where(credential_type: AuthenticationOption::EMAIL).
        where.not(hashed_email: new_hashed_email).
        destroy_all
    end

    success
  end

  def update_primary_contact_info!(new_email: nil, new_hashed_email: nil)
    success = update_primary_contact_info(new_email: new_email, new_hashed_email: new_hashed_email)
    raise "User's primary contact info was not updated successfully" unless success
    success
  end
end
