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

  after_commit :reset_policy_cache
  after_create_commit :lock_user_login!

  private def user_must_be_student
    return unless user
    errors.add(:user, 'must be a student') unless user.student?
  end

  private def reset_policy_cache
    Policies::DemoSections.reset_cache!
  end

  # Fires only via DemoStudent.create!/save!. Direct SQL inserts into the
  # demo_students table bypass this and leave the linked user un-locked.
  private def lock_user_login!
    section_login_types = user.sections_as_student.pluck(:login_type).uniq
    unless section_login_types.any? && section_login_types.all? {|t| ALLOWED_SECTION_LOGIN_TYPES.include?(t)}
      Honeybadger.notify(
        'Demo student is not exclusively in email/word/picture sections',
        context: {user_id: user_id, demo_type: demo_type, section_login_types: section_login_types},
      )
      return false
    end

    ActiveRecord::Base.transaction do
      user.update!(
        secret_words: nil,
        secret_picture_id: nil,
        encrypted_password: '',
        hashed_email: '',
        email: '',
        provider: nil,
        uid: nil,
      )
      user.authentication_options.destroy_all
    end
    true
  rescue StandardError => exception
    Honeybadger.notify(
      exception,
      context: {message: 'Failed to lock demo student login', user_id: user_id, demo_type: demo_type},
    )
    false
  end
end
