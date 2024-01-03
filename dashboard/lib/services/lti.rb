require 'policies/lti'
require 'queries/lti'
require 'user'
require 'authentication_option'

class Services::Lti
  def self.initialize_lti_user(id_token)
    user_type = Policies::Lti.get_account_type(id_token)
    user = User.new
    user.provider = User::PROVIDER_MIGRATED
    user.user_type = user_type
    if user_type == User::TYPE_TEACHER
      user.age = '21+'
      user.name = get_claim_from_list(id_token, Policies::Lti::TEACHER_NAME_KEYS)
    else
      user.name = get_claim_from_list(id_token, Policies::Lti::STUDENT_NAME_KEYS)
      user.family_name = get_claim(id_token, :family_name)
    end
    ao = AuthenticationOption.new(
      authentication_id: Policies::Lti.generate_auth_id(id_token),
      credential_type: AuthenticationOption::LTI_V1,
      email: get_claim(id_token, :email),
    )
    user.authentication_options = [ao]
    user
  end

  def self.create_lti_user_identity(user)
    auth_option = user.authentication_options.find(&:lti?)
    issuer, client_id, subject = auth_option.authentication_id.split('|')
    lti_integration = Queries::Lti.get_lti_integration(issuer, client_id)
    LtiUserIdentity.create(user: user, subject: subject, lti_integration: lti_integration)
  end

  def self.get_claim_from_list(id_token, keys_array)
    keys_array.filter_map {|key| get_claim(id_token, key)}.first
  end

  def self.get_claim(id_token, key)
    id_token[key] || id_token.dig(Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym, key)
  end

  def self.initialize_lti_student_from_nrps(client_id:, issuer:, nrps_member:)
    nrps_member_message = nrps_member[:message].first
    user = User.new
    user.provider = User::PROVIDER_MIGRATED
    user.user_type = User::TYPE_STUDENT
    user.name = get_claim_from_list(nrps_member_message, Policies::Lti::STUDENT_NAME_KEYS)
    user.family_name = get_claim(nrps_member_message, :family_name)
    id_token = {
      sub: nrps_member[:user_id],
      aud: client_id,
      iss: issuer,
    }
    ao = AuthenticationOption.new(
      authentication_id: Policies::Lti.generate_auth_id(id_token),
      credential_type: AuthenticationOption::LTI_V1,
      email: get_claim(nrps_member_message, :email),
      )
    user.authentication_options = [ao]
    user
  end

  def self.parse_nrps_response(nrps_response)
    sections = {}
    members = nrps_response[:members]
    context_title = nrps_response.dig(:context, :title)
    members.each do |member|
      next if member[:status] == 'Inactive' || member[:roles].exclude?(Policies::Lti::CONTEXT_LEARNER_ROLE)
      # TODO: handle multiple messages. Shouldn't be needed until we support Deep Linking.
      message = member[:message].first

      # Custom variables substitutions must be configured in the LMS.
      custom_variables = message[Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym]

      # Handles the possibility of the LMS not having sectionId variable substitution configured.
      member_section_ids = custom_variables[:section_ids]&.split(',') || [nil]
      # :section_names from Canvas is a stringified JSON array
      member_section_names = JSON.parse(custom_variables[:section_names])
      member_section_ids.each_with_index do |section_id, index|
        if sections[section_id].present?
          sections[section_id][:members] << member
        else
          sections[section_id] = {
            name: "#{context_title}: #{member_section_names[index]}",
            members: [member],
          }
        end
      end
    end
    sections
  end

  # Takes an LTI section and NRPS members array and syncs a single section.
  def self.sync_section_roster(lti_integration, lti_section, nrps_members)
    client_id = lti_integration.client_id
    issuer = lti_integration.issuer
    current_students = nrps_members.map do |nrps_member|
      student = Queries::Lti.get_user_from_nrps(
        client_id: client_id,
        issuer: issuer,
        nrps_member: nrps_member
      )
      student ||= initialize_lti_student_from_nrps(
        client_id: client_id,
        issuer: issuer,
        nrps_member: nrps_member
      )
      student.save!
      lti_section.section.add_student(student)
      student
    end

    # Prune students who have been removed from the section in the LMS
    lti_section.followers.each do |follower|
      current_students.find_index {|s| s.id == follower.student_user_id} || follower.destroy
    end
  end

  # Syncs a course and all its sections from an NRPS response.
  def self.sync_course_roster(lti_integration:, lti_course:, nrps_sections:, section_owner_id:)
    lti_sections = LtiSection.where(lti_course_id: lti_course.id)

    # Prune sections that have been deleted in the LMS
    lti_sections.each do |lti_section|
      lti_section.destroy unless nrps_sections.key?(lti_section.lms_section_id)
    end

    nrps_sections.keys.each do |lms_section_id|
      section_name = nrps_sections[lms_section_id][:name]
      # Check if lti_sections already contains a section with this lms_section_id
      lti_section = lti_sections.find_by(lms_section_id: lms_section_id)
      if lti_section.nil?
        section = Section.new(
          {
            user_id: section_owner_id,
            name: section_name,
            login_type: Section::LOGIN_TYPE_LTI_V1,
          }
        )
        lti_section = LtiSection.create(lti_course_id: lti_course.id, lms_section_id: lms_section_id, section: section)
      end
      lti_section.section.update(name: section_name) unless lti_section.section.name == section_name
      sync_section_roster(lti_integration, lti_section, nrps_sections[lms_section_id][:members])
    end
  end
end
