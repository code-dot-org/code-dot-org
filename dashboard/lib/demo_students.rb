# frozen_string_literal: true

# Prevents logging in as accounts listed in the `demo_students` table.
# See app/models/demo_student.rb for the source of truth.
module DemoStudents
  # OAuth and SSO credentials are not supported for demo students.
  ALLOWED_SECTION_LOGIN_TYPES = [
    Section::LOGIN_TYPE_EMAIL,
    Section::LOGIN_TYPE_WORD,
    Section::LOGIN_TYPE_PICTURE,
  ].freeze

  # Returns true on success, false if the id was skipped.
  def self.prevent_demo_student_login(user_id, demo_type)
    user = User.find_by(id: user_id)
    unless user
      Honeybadger.notify('Demo student id not found', context: {user_id: user_id, demo_type: demo_type})
      return false
    end

    unless user.student?
      Honeybadger.notify(
        'Demo student id is not a student',
        context: {user_id: user_id, demo_type: demo_type, user_type: user.user_type},
      )
      return false
    end

    section_login_types = user.sections_as_student.pluck(:login_type).uniq
    if section_login_types.empty? || section_login_types.any? {|t| ALLOWED_SECTION_LOGIN_TYPES.exclude?(t)}
      Honeybadger.notify(
        'Demo student is not exclusively in email/word/picture sections',
        context: {user_id: user_id, demo_type: demo_type, section_login_types: section_login_types},
      )
      return false
    end

    # Clearing encrypted_password also rotates Devise's authenticatable_salt,
    # which invalidates any active sessions for this user on the next request.
    # For migrated users User#email/#hashed_email read through
    # primary_contact_info, so destroy_all on authentication_options is what
    # actually severs the live identity; the column clears below cover the
    # legacy/unmigrated path.
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
  end
end
