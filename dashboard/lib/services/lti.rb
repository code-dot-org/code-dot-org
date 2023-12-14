require 'policies/lti'
require 'user'
require 'authentication_option'

class Services::Lti
  def self.initialize_lti_user(id_token)
    user_type = Policies::Lti.get_account_type(id_token)
    teacher_name_keys = [:name, :display_name, :full_name, :family_name, :given_name]
    student_name_keys = [:name, :display_name, :full_name, :given_name]

    user = User.new
    user.provider = User::PROVIDER_MIGRATED
    user.user_type = user_type
    if user_type == User::TYPE_TEACHER
      user.age = '21+'
      user.name = get_claim_from_list(id_token, teacher_name_keys)
    else
      user.name = get_claim_from_list(id_token, student_name_keys)
      user.family_name = get_claim(id_token, :family_name)
    end
    ao = AuthenticationOption.new(
      authentication_id: Policies::Lti.generate_auth_id(id_token),
      credential_type: AuthenticationOption::LTI_V1,
      email: get_claim(id_token, :email),
    )
    user.authentication_options = [ao]
    user
  end

  def self.get_claim_from_list(id_token, keys_array)
    keys_array.filter_map {|key| get_claim(id_token, key)}.first
  end

  def self.get_claim(id_token, key)
    id_token[key] || id_token.dig(Policies::Lti::LTI_CUSTOM_CLAIMS, key)
  end
end
