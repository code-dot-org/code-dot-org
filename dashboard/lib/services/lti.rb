require 'policies/lti'
require 'user'
require 'authentication_option'

class Services::Lti
  def self.initialize_lti_user(id_token)
    user_type = Policies::Lti.get_account_type(id_token)
    teacher_keys = [:name, :display_name, :full_name, :family_name, :given_name]
    student_keys = [:name, :display_name, :full_name, :given_name]

    user = User.new
    user.provider = User::PROVIDER_MIGRATED
    user.user_type = user_type
    if user_type == User::TYPE_TEACHER
      user.age = '21+'
      user.name = teacher_keys.filter_map {|key| get_value(id_token, key)}.compact.first
    else
      user.name = student_keys.filter_map {|key| get_value(id_token, key)}.compact.first
      user.family_name = get_value(id_token, :family_name)
    end
    ao = AuthenticationOption.new(
      authentication_id: Policies::Lti.generate_auth_id(id_token),
      credential_type: AuthenticationOption::LTI_V1,
      email: get_value(id_token, :email),
    )
    user.authentication_options = [ao]
    user
  end

  def self.get_value(id_token, key)
    id_token[key] || id_token.dig(Policies::Lti::LTI_CUSTOM_CLAIMS, key)
  end
end
