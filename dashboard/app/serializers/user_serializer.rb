# == Schema Information
#
# Table name: users
#
#  id                         :integer          not null, primary key
#  email                      :string(255)      default(""), not null
#  encrypted_password         :string(255)      default("")
#  reset_password_token       :string(255)
#  reset_password_sent_at     :datetime
#  remember_created_at        :datetime
#  sign_in_count              :integer          default(0)
#  current_sign_in_at         :datetime
#  last_sign_in_at            :datetime
#  current_sign_in_ip         :string(255)
#  last_sign_in_ip            :string(255)
#  created_at                 :datetime
#  updated_at                 :datetime
#  username                   :string(255)
#  provider                   :string(255)
#  uid                        :string(255)
#  admin                      :boolean
#  gender                     :string(1)
#  name                       :string(255)
#  locale                     :string(10)       default("en-US"), not null
#  birthday                   :date
#  user_type                  :string(16)
#  school                     :string(255)
#  full_address               :string(1024)
#  total_lines                :integer          default(0), not null
#  prize_earned               :boolean          default(FALSE)
#  prize_id                   :integer
#  teacher_prize_earned       :boolean          default(FALSE)
#  teacher_prize_id           :integer
#  teacher_bonus_prize_earned :boolean          default(FALSE)
#  teacher_bonus_prize_id     :integer
#  confirmation_token         :string(255)
#  confirmed_at               :datetime
#  confirmation_sent_at       :datetime
#  unconfirmed_email          :string(255)
#  prize_teacher_id           :integer
#  secret_picture_id          :integer
#  active                     :boolean          default(TRUE), not null
#  hashed_email               :string(255)
#  deleted_at                 :datetime
#  secret_words               :string(255)
#  properties                 :text(65535)
#  invitation_token           :string(255)
#  invitation_created_at      :datetime
#  invitation_sent_at         :datetime
#  invitation_accepted_at     :datetime
#  invitation_limit           :integer
#  invited_by_id              :integer
#  invited_by_type            :string(255)
#  invitations_count          :integer          default(0)
#  country                    :string(255)
#  school_type                :string(255)
#  school_state               :string(255)
#  school_zip                 :integer
#  school_district_id         :integer
#  school_district_other      :boolean
#
# Indexes
#
#  index_users_on_confirmation_token_and_deleted_at      (confirmation_token,deleted_at) UNIQUE
#  index_users_on_email_and_deleted_at                   (email,deleted_at)
#  index_users_on_hashed_email_and_deleted_at            (hashed_email,deleted_at)
#  index_users_on_invitation_token                       (invitation_token) UNIQUE
#  index_users_on_invitations_count                      (invitations_count)
#  index_users_on_invited_by_id                          (invited_by_id)
#  index_users_on_prize_id_and_deleted_at                (prize_id,deleted_at) UNIQUE
#  index_users_on_provider_and_uid_and_deleted_at        (provider,uid,deleted_at) UNIQUE
#  index_users_on_reset_password_token_and_deleted_at    (reset_password_token,deleted_at) UNIQUE
#  index_users_on_teacher_bonus_prize_id_and_deleted_at  (teacher_bonus_prize_id,deleted_at) UNIQUE
#  index_users_on_teacher_prize_id_and_deleted_at        (teacher_prize_id,deleted_at) UNIQUE
#  index_users_on_unconfirmed_email_and_deleted_at       (unconfirmed_email,deleted_at)
#  index_users_on_username_and_deleted_at                (username,deleted_at) UNIQUE
#

class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :ops_first_name, :ops_last_name, :district, :ops_school, :ops_gender
  def district
    DistrictSerializer.new(object.district).attributes if object
  end
end
