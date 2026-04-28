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

  # Boot-time sweep. Locks every account referenced by a DemoStudent row.
  # Idempotent — safe to re-run.
  def self.prevent_demo_student_logins
    DemoStudent.find_each do |demo_student|
      prevent_demo_student_login(demo_student.user_id, demo_student.demo_type)
    end
  end

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
    unless section_login_types.any? {|login_type| ALLOWED_SECTION_LOGIN_TYPES.include?(login_type)}
      Honeybadger.notify(
        'Demo student is not in any email/word/picture section',
        context: {user_id: user_id, demo_type: demo_type, section_login_types: section_login_types},
      )
      return false
    end

    user.update!(
      secret_words: nil,
      secret_picture_id: nil,
      encrypted_password: '',
      hashed_email: '',
    )
    user.authentication_options.destroy_all
    true
  end
end
