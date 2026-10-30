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
  # Raised when something tries to destroy this row or hard-delete/purge the
  # linked user. The row grants the user's demo protections, so `archive!` it
  # instead of destroying it.
  class ProtectedRecord < StandardError; end

  # OAuth and SSO credentials cannot be cleared for demo students.
  ALLOWED_SECTION_LOGIN_TYPES = [
    Section::LOGIN_TYPE_EMAIL,
    Section::LOGIN_TYPE_WORD,
    Section::LOGIN_TYPE_PICTURE,
  ].freeze

  belongs_to :user
  validates :demo_type, inclusion: {in: ->(_) {Policies::DemoSections::VALID_DEMO_TYPES.map(&:to_s)}}
  validates :user_id, uniqueness: {scope: :demo_type}
  validate :user_must_be_student
  validate :user_in_allowed_section_types, on: :create

  after_create :strip_user_login_credentials!
  after_commit :reset_policy_cache
  before_destroy :prevent_destroy

  def archive!
    update!(demo_type: Policies::DemoSections::ARCHIVED_DEMO_TYPE.to_s)
  end

  def archived?
    demo_type == Policies::DemoSections::ARCHIVED_DEMO_TYPE.to_s
  end

  private def user_must_be_student
    return unless user
    errors.add(:user, 'must be a student') unless user.student?
  end

  # A user can be flagged as a demo student only if their entire section
  # membership is in login types where credentials are issued at the section
  # level (word/picture) or via a plain email/password we can null out.
  # OAuth/SSO sections aren't strippable: clearing `encrypted_password` doesn't
  # block the IdP from signing the user back in.
  private def user_in_allowed_section_types
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

  private def prevent_destroy
    raise ProtectedRecord,
      "Cannot destroy demo student record (user_id=#{user_id}); archive! it instead."
  end

  # Runs inside the create transaction (via after_create), so a credential
  # strip failure rolls back the demo_students insert and the user keeps
  # their credentials. Direct SQL inserts into the demo_students table
  # bypass this and leave the linked user with their credentials intact.
  private def strip_user_login_credentials!
    user.strip_login_credentials!
  end
end
