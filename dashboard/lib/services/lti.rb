require 'policies/lti'
require 'user'
require 'authentication_option'

class Services::Lti
  def self.partially_create_user(session, id_token)
    user_type = Policies::Lti.get_account_type(id_token)
    user = User.new
    user.provider = User::PROVIDER_MIGRATED
    user.user_type = user_type
    if user_type == User::TYPE_TEACHER
      user.age = '21+'
      user.name = id_token[:name] || id_token[:given_name]
    end
    # user.name = id_token[:given_name] || id_token[:name]
    if user_type == User::TYPE_STUDENT
      user.name = id_token[:given_name] || id_token[:name]
      user.family_name = id_token[:family_name]
      user.age = "15" # TODO: remove
    end
    user.authentication_options = [
      AuthenticationOption.new(
        authentication_id: Policies::Lti.generate_auth_id(id_token),
         credential_type: AuthenticationOption::LTI_V1,
       )
    ]
    # user.save!
    user

    # Session signup type
    # Signup Tracking
  end
end
