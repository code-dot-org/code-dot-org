# == Schema Information
#
# Table name: demo_students
#
#  id         :bigint           not null, primary key
#  user_id    :integer          not null
#  demo_type  :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_demo_students_on_demo_type_and_user_id  (demo_type,user_id)
#  index_demo_students_on_user_id_and_demo_type  (user_id,demo_type) UNIQUE
#
class DemoStudent < ApplicationRecord
  # Raised when something tries to hard-delete or purge a user that is a demo
  # student. Soft-delete (paranoia) is allowed and the demo_students row is
  # preserved so `Policies::DemoSections.demo_student?` keeps returning true
  # for permission checks against archived users.
  class ProtectedRecord < StandardError; end

  # OAuth and SSO credentials cannot be cleared for demo students.
  ALLOWED_SECTION_LOGIN_TYPES = [
    Section::LOGIN_TYPE_EMAIL,
    Section::LOGIN_TYPE_WORD,
    Section::LOGIN_TYPE_PICTURE,
  ].freeze

  belongs_to :user
  validates :demo_type, inclusion: {in: ->(_) {Policies::DemoSections::DEMO_TYPES.map(&:to_s)}}
  validates :user_id, uniqueness: {scope: :demo_type}
  validate :user_must_be_student
  validate :user_must_be_lockable, on: :create

  after_create :lock_user_login!
  after_commit :reset_policy_cache

  private def user_must_be_student
    return unless user
    errors.add(:user, 'must be a student') unless user.student?
  end

  # A user can be flagged as a demo student only if their entire section
  # membership is in login types where credentials are issued at the section
  # level (word/picture) or via a plain email/password we can null out.
  # OAuth/SSO sections aren't lockable: clearing `encrypted_password` doesn't
  # block the IdP from signing the user back in.
  private def user_must_be_lockable
    return unless user
    types = user.sections_as_student.pluck(:login_type).uniq
    return if types.any? && types.all? {|t| ALLOWED_SECTION_LOGIN_TYPES.include?(t)}
    errors.add(
      :user,
      "must be exclusively in email/word/picture sections " \
        "(got: #{types.inspect})",
    )
  end

  private def reset_policy_cache
    Policies::DemoSections.reset_cache!
  end

  # Runs inside the implicit save transaction so a lockdown failure rolls
  # back the demo_students insert and the user keeps their credentials.
  # Clearing `encrypted_password` also rotates Devise's authenticatable_salt,
  # which signs out any active sessions on the next request. Authentication
  # options are hard-deleted (not paranoia-soft-deleted) so OAuth refresh
  # tokens and hashed credentials don't linger in the database.
  #
  # Fires only via DemoStudent.create!/save!. Direct SQL inserts into the
  # demo_students table bypass this and leave the linked user un-locked.
  private def lock_user_login!
    user.update!(
      secret_words: nil,
      secret_picture_id: nil,
      encrypted_password: '',
      hashed_email: '',
      email: '',
      provider: nil,
      uid: nil,
    )
    user.authentication_options.with_deleted.each(&:really_destroy!)
  end
end
