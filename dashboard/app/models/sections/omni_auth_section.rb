# == Schema Information
#
# Table name: sections
#
#  id                   :integer          not null, primary key
#  user_id              :integer          not null
#  name                 :string(255)
#  created_at           :datetime
#  updated_at           :datetime
#  code                 :string(255)
#  script_id            :integer
#  course_id            :integer
#  grade                :string(255)
#  login_type           :string(255)      default("email"), not null
#  deleted_at           :datetime
#  stage_extras         :boolean          default(FALSE), not null
#  section_type         :string(255)
#  first_activity_at    :datetime
#  pairing_allowed      :boolean          default(TRUE), not null
#  sharing_disabled     :boolean          default(FALSE), not null
#  hidden               :boolean          default(FALSE), not null
#  tts_autoplay_enabled :boolean          default(FALSE), not null
#  restrict_section     :boolean          default(FALSE)
#
# Indexes
#
#  fk_rails_20b1e5de46        (course_id)
#  index_sections_on_code     (code) UNIQUE
#  index_sections_on_user_id  (user_id)
#

class OmniAuthSection < Section
  def self.from_omniauth(code:, type:, owner_id:, students:, section_name: I18n.t('sections.default_name', default: 'Untitled Section'))
    oauth_section = with_deleted.where(code: code).first_or_create

    oauth_section.name = section_name || I18n.t('sections.default_name', default: 'Untitled Section')
    oauth_section.user_id = owner_id
    oauth_section.login_type = type

    oauth_section.save! if oauth_section.changed?

    oauth_section.restore if oauth_section.deleted?

    oauth_students = students.map do |student|
      User.from_omniauth(student, {'user_type' => User::TYPE_STUDENT})
    end

    oauth_section.set_exact_student_list(oauth_students)

    oauth_section.name = section_name
    oauth_section.save! if oauth_section.changed?

    oauth_section
  end

  def set_exact_student_list(target_students)
    students_to_add = target_students - students
    students_to_remove = students - target_students

    students_to_add.each do |student|
      add_student student
    end

    followers.where(student_user: students_to_remove).destroy_all
  end

  def provider_managed?
    true
  end
end
