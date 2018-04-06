# == Schema Information
#
# Table name: authentication_options
#
#  id                :integer          not null, primary key
#  email             :string(255)      default(""), not null
#  hashed_email      :string(255)      default(""), not null
#  credential_type   :string(255)      not null
#  authentication_id :string(255)
#  data              :string(255)
#  deleted_at        :datetime
#  user_id           :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_auth_on_cred_type_and_auth_id                          (credential_type,authentication_id,deleted_at) UNIQUE
#  index_authentication_options_on_email_and_deleted_at         (email,deleted_at)
#  index_authentication_options_on_hashed_email_and_deleted_at  (hashed_email,deleted_at)
#  index_authentication_options_on_user_id_and_deleted_at       (user_id,deleted_at)
#

class AuthenticationOption < ApplicationRecord
  acts_as_paranoid
  belongs_to :user

  # These are duplicated from the user model, until we're ready to cut over and remove them from there
  before_save :normalize_email, :hash_email, :fix_by_user_type

  def fix_by_user_type
    self.email = '' if user.student?
  end

  def normalize_email
    return unless email.present?
    self.email = email.strip.downcase
  end

  def self.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  def hash_email
    return unless email.present?
    self.hashed_email = AuthenticationOption.hash_email(email)
    self.authentication_id = hashed_email if credential_type == 'email'
  end
end
