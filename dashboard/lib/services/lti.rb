require 'policies/lti'
require 'user'
require 'authentication_option'

class Services::Lti
  def self.partially_create_user(id_token)
    custom_claims = id_token["https://purl.imsglobal.org/spec/lti/claim/custom"]
    user_type = Policies::Lti.get_account_type(id_token)
    user = User.new
    user.provider = User::PROVIDER_MIGRATED
    user.user_type = user_type
    if user_type == User::TYPE_TEACHER
      user.age = '21+'
      user.name = custom_claims[:display_name] || custom_claims[:full_name] || custom_claims[:family_name] || custom_claims[:given_name]
    else
      user.name = custom_claims[:display_name] || custom_claims[:full_name] || custom_claims[:given_name]
      user.family_name = custom_claims[:family_name]
    end
    user.authentication_options = [
      AuthenticationOption.new(
        authentication_id: Policies::Lti.generate_auth_id(id_token),
        credential_type: AuthenticationOption::LTI_V1,
        email: id_token[:email],
      )
    ]

    user
  end
end
