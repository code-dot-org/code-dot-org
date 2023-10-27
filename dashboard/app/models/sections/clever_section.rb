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
#  properties           :text(65535)
#  participant_type     :string(255)      default("student"), not null
#
# Indexes
#
#  fk_rails_20b1e5de46        (course_id)
#  index_sections_on_code     (code) UNIQUE
#  index_sections_on_user_id  (user_id)
#

class CleverSection < OmniAuthSection
  def self.from_service(course_id, owner_id, student_list, section_name)
    code = "C-#{course_id}"

    set_family_name = DCDO.get('clever_family_name', false)

    students = student_list.map do |student|
      data = student['data']
      OmniAuth::AuthHash.new(
        uid: data['id'],
        provider: 'clever',
        info: {
          name: set_family_name ? data['name']['first'] : data['name'],
          family_name: set_family_name ? data['name']['last'] : nil,
          dob: data['dob'],
        },
      )
    end

    from_omniauth(
      code: code,
      type: Section::LOGIN_TYPE_CLEVER,
      owner_id: owner_id,
      students: students,
      section_name: section_name,
    )
  end
end
