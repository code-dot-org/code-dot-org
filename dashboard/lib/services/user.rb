class Services::User
  # Takes the ActiveRecord form parameters submitted by a user and applies the
  # new values to the given User instance.
  def self.assign_form_params(user, params)
    assign_auth_option_params(user, params)
    # Remove nested attributes for authentication_options to prevent
    # duplicates when email is ommitted from the LTI launch response
    flat_params = params.except('authentication_options_attributes')
    user.assign_attributes(flat_params.compact)
  end

  # user.authentication_options is a nested attribute we expose on the form
  # for creating new user accounts. This code looks for new authentication
  # option values submitted by the user, such as email, and updates the User
  # object.
  # Since a User can have multiple AuthenticationOptions, the form code treats
  # the nested attribute as an Array, however there should only ever be one
  # value when a new account is being created. Since the User and
  # AuthenticationOptions haven't actually been created in the DB yet, there is
  # no unique `id` attribute for the objects, so we will assume the index in the
  # array is consistent between the `user.authentication_options` and form
  # `params`.
  def self.assign_auth_option_params(user, params)
    #"authentication_options_attributes"=>{"0"=>{"email"=>"test@example.com"}}
    params_aos = params['authentication_options_attributes']
    if params_aos
      user.authentication_options&.each_with_index do |user_ao, index|
        # Get the authentication option settings from the form params
        params_ao = params_aos[index.to_s]
        # Apply the form params to the AuthenticationOption
        user_ao.assign_attributes(params_ao.compact)
      end
    end
  end
end
