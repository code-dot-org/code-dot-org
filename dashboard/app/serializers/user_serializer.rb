# == Schema Information
#
# Table name: users
#
#  id                               :integer          not null, primary key
#  studio_person_id                 :integer
#  email                            :string(255)      default(""), not null
#  parent_email                     :string(255)
#  encrypted_password               :string(255)      default("")
#  reset_password_token             :string(255)
#  reset_password_sent_at           :datetime
#  remember_created_at              :datetime
#  sign_in_count                    :integer          default(0)
#  current_sign_in_at               :datetime
#  last_sign_in_at                  :datetime
#  current_sign_in_ip               :string(255)
#  last_sign_in_ip                  :string(255)
#  created_at                       :datetime
#  updated_at                       :datetime
#  username                         :string(255)
#  provider                         :string(255)
#  uid                              :string(255)
#  admin                            :boolean
#  gender                           :string(1)
#  name                             :string(255)
#  locale                           :string(10)       default("en-US"), not null
#  birthday                         :date
#  user_type                        :string(16)
#  school                           :string(255)
#  full_address                     :string(1024)
#  school_info_id                   :integer
#  total_lines                      :integer          default(0), not null
#  secret_picture_id                :integer
#  active                           :boolean          default(TRUE), not null
#  hashed_email                     :string(255)
#  deleted_at                       :datetime
#  purged_at                        :datetime
#  secret_words                     :string(255)
#  properties                       :text(65535)
#  invitation_token                 :string(255)
#  invitation_created_at            :datetime
#  invitation_sent_at               :datetime
#  invitation_accepted_at           :datetime
#  invitation_limit                 :integer
#  invited_by_id                    :integer
#  invited_by_type                  :string(255)
#  invitations_count                :integer          default(0)
#  terms_of_service_version         :integer
#  urm                              :boolean
#  races                            :string(255)
#  primary_authentication_option_id :integer
#
# Indexes
#
#  index_users_on_birthday                             (birthday)
#  index_users_on_current_sign_in_at                   (current_sign_in_at)
#  index_users_on_deleted_at                           (deleted_at)
#  index_users_on_email_and_deleted_at                 (email,deleted_at)
#  index_users_on_hashed_email_and_deleted_at          (hashed_email,deleted_at)
#  index_users_on_invitation_token                     (invitation_token) UNIQUE
#  index_users_on_invitations_count                    (invitations_count)
#  index_users_on_invited_by_id                        (invited_by_id)
#  index_users_on_parent_email                         (parent_email)
#  index_users_on_provider_and_uid_and_deleted_at      (provider,uid,deleted_at) UNIQUE
#  index_users_on_purged_at                            (purged_at)
#  index_users_on_reset_password_token_and_deleted_at  (reset_password_token,deleted_at) UNIQUE
#  index_users_on_school_info_id                       (school_info_id)
#  index_users_on_studio_person_id                     (studio_person_id)
#  index_users_on_username_and_deleted_at              (username,deleted_at) UNIQUE
#

class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :ops_first_name, :ops_last_name, :district, :ops_school, :ops_gender, :races
  def district
    DistrictSerializer.new(object.district).attributes if object
  end
end
