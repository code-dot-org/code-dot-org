# A section rostered from a ClassLink One Roster class. The section code is
# "CL-<TenantId>|<classSourcedId>": the tenant scopes the class sourcedId,
# which is only unique per district, so codes stay unique across districts.
# The tenant component exists for uniqueness and operator legibility only —
# credentials are always resolved from the requesting user's own auth option,
# never from the code.
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
#  lti_integration_id   :bigint
#  avatar_color         :integer
#  avatar_emoji         :integer
#  ai_chat_access_level :string(255)      default("disabled")
#  demo_type            :string(255)
#
# Indexes
#
#  fk_rails_20b1e5de46                      (course_id)
#  fk_rails_f0d4df9901                      (lti_integration_id)
#  index_sections_on_code                   (code) UNIQUE
#  index_sections_on_script_id              (script_id)
#  index_sections_on_user_id                (user_id)
#  index_sections_on_user_id_and_demo_type  (user_id,demo_type,deleted_at) UNIQUE
#
class ClasslinkSection < OmniAuthSection
  CODE_PREFIX = 'CL-'.freeze

  def self.code_for(tenant_id, class_sourced_id)
    "#{CODE_PREFIX}#{tenant_id}#{AuthenticationOption::Classlink::SEPARATOR}#{class_sourced_id}"
  end

  # Splits a section code into [tenant_id, class_sourced_id]. The split limit
  # is load-bearing: a classSourcedId may itself contain a pipe, and the
  # ClassLink-assigned tenant id cannot, so the first pipe is the boundary.
  def self.parse_code(code)
    code.to_s.delete_prefix(CODE_PREFIX).split(AuthenticationOption::Classlink::SEPARATOR, 2)
  end

  def class_sourced_id
    ClasslinkSection.parse_code(code).last
  end

  # student_list holds One Roster user records already filtered to
  # role == "student" and reduced to the fields the client extracts.
  # Like Clever and Google Classroom, email is deliberately not passed:
  # roster-imported students carry no stored email address. One Roster
  # supplies no birthDate, so no dob is passed either.
  def self.from_service(class_sourced_id, tenant_id, owner_id, student_list, section_name)
    tenant = tenant_id.to_s
    code = code_for(tenant, class_sourced_id)

    students = student_list.map do |student|
      OmniAuth::AuthHash.new(
        uid: "#{tenant}#{AuthenticationOption::Classlink::SEPARATOR}#{student['sourcedId']}",
        provider: AuthenticationOption::CLASSLINK,
        info: {
          name: student['givenName'],
          family_name: student['familyName'],
        },
      )
    end

    from_omniauth(
      code: code,
      type: Section::LOGIN_TYPE_CLASSLINK,
      owner_id: owner_id,
      students: students,
      section_name: section_name,
    )
  end
end
