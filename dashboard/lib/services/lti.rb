require 'policies/lti'
require 'queries/lti'
require 'user'
require 'authentication_option'
require 'sections/section'
require 'set'
require 'metrics/events'

module Services
  module Lti
    def self.initialize_lti_user(id_token)
      user_type = Policies::Lti.get_account_type(id_token[Policies::Lti::LTI_ROLES_KEY])
      user = ::User.new
      user.provider = ::User::PROVIDER_MIGRATED
      user.user_type = user_type
      if user_type == ::User::TYPE_TEACHER
        user.age = '21+'
        user.name = get_claim_from_list(id_token, Policies::Lti::TEACHER_NAME_KEYS)
        user.lti_roster_sync_enabled = true
      else
        user.name = get_claim_from_list(id_token, Policies::Lti::STUDENT_NAME_KEYS)
        user.family_name = get_claim(id_token, :family_name)
      end
      ao = AuthenticationOption.new(
        authentication_id: Services::Lti::AuthIdGenerator.new(id_token).call,
        credential_type: AuthenticationOption::LTI_V1,
        email: get_claim(id_token, :email),
      )
      user.authentication_options = [ao]
      # TODO As final step of the LTI user creation, create LtiUserIdentity for the new user. https://codedotorg.atlassian.net/browse/P20-788
      user
    end

    def self.create_lti_user_identity(user)
      auth_option = user.authentication_options.find(&:lti?)
      issuer, client_id, subject = auth_option.authentication_id.split('|')
      lti_integration = Queries::Lti.get_lti_integration(issuer, client_id)
      LtiUserIdentity.create!(user: user, subject: subject, lti_integration: lti_integration)
    end

    def self.create_lti_integration(
      name:,
      client_id:,
      issuer:,
      platform_name:,
      auth_redirect_url:,
      jwks_url:,
      access_token_url:,
      admin_email:
      )
      LtiIntegration.create!(
        name: name,
        client_id: client_id,
        issuer: issuer,
        platform_name: platform_name,
        auth_redirect_url: auth_redirect_url,
        jwks_url: jwks_url,
        access_token_url: access_token_url,
        admin_email: admin_email
      )
    end

    def self.create_lti_deployment(integration_id, deployment_id)
      LtiDeployment.create(
        lti_integration_id: integration_id,
        deployment_id: deployment_id,
      )
    end

    def self.get_claim_from_list(id_token, keys_array)
      keys_array.filter_map {|key| get_claim(id_token, key)}.first
    end

    def self.get_claim(id_token, key)
      id_token[key] || id_token.dig(Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym, key)
    end

    def self.lti_user_roles(nrps_section, lti_user_id)
      nrps_member = nrps_section[:members].find {|member| member[:user_id] == lti_user_id}

      if nrps_member.present?
        nrps_member[:roles]
      end
    end

    def self.lti_user_type(current_user, lti_integration, nrps_section)
      lti_user_id = Queries::Lti.lti_user_id(current_user, lti_integration)
      member_roles = lti_user_roles(nrps_section, lti_user_id)

      if Policies::Lti.lti_teacher?(member_roles)
        return ::User::TYPE_TEACHER
      end

      return ::User::TYPE_STUDENT
    end

    def self.initialize_lti_user_from_nrps(client_id:, issuer:, nrps_member:)
      nrps_member_message = Policies::Lti.issuer_accepts_resource_link?(issuer) ? nrps_member[:message].first : nrps_member
      email_address = get_claim(nrps_member_message, :email)
      account_type = Policies::Lti.get_account_type(nrps_member[:roles])

      user = ::User.new
      user.provider = ::User::PROVIDER_MIGRATED
      user.name = get_claim_from_list(nrps_member_message, Policies::Lti::STUDENT_NAME_KEYS)

      if account_type == ::User::TYPE_TEACHER && email_address.present?
        user.user_type = ::User::TYPE_TEACHER
        user.lti_roster_sync_enabled = true
      else
        user.user_type = ::User::TYPE_STUDENT
        user.family_name = get_claim(nrps_member_message, :family_name)
      end

      id_token = {
        sub: nrps_member[:user_id],
        aud: client_id,
        iss: issuer,
      }
      ao = AuthenticationOption.new(
        authentication_id: Services::Lti::AuthIdGenerator.new(id_token).call,
        credential_type: AuthenticationOption::LTI_V1,
        email: email_address,
        )
      user.authentication_options = [ao]
      user.primary_contact_info = ao
      # TODO As final step of the LTI user creation, create LtiUserIdentity for the new user. https://codedotorg.atlassian.net/browse/P20-788
      user
    end

    def self.parse_nrps_response(nrps_response, issuer)
      sections = {}
      members = nrps_response[:members]
      context_title = nrps_response.dig(:context, :title)
      members.each do |member|
        next if member[:status] == 'Inactive' || member[:roles].include?(Policies::Lti::CONTEXT_MENTOR_ROLE)
        # TODO: handle multiple messages. Shouldn't be needed until we support Deep Linking.

        # If the LMS hasn't implemented the resource link level membership service, we don't get the message property in the member object
        if Policies::Lti.issuer_accepts_resource_link?(issuer)
          message = member[:message].first

          # Custom variables substitutions must be configured in the LMS.
          custom_variables = message[Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym]

          member_section_ids = custom_variables[:section_ids]&.split(',') || [nil]
          # :section_names from Canvas is a stringified JSON array
          member_section_names = JSON.parse(custom_variables[:section_names])

        else
          member_section_ids = [nrps_response.dig(:context, :id)]
          member_section_names = [nil]
        end
        member_section_ids.each_with_index do |section_id, index|
          if sections[section_id].present?
            sections[section_id][:members] << member
          else
            sections[section_id] = {
              # Schoology provides Course and section name in context_title
              name: member_section_names[index].nil? ? context_title.to_s : "#{context_title}: #{member_section_names[index]}",
              short_name: member_section_names[index] || context_title.to_s,
              members: [member],
            }
          end
        end
      end
      sections
    end

    # Takes an LTI section and NRPS members array and syncs a single section.
    # @return {boolean} whether any changes were made
    def self.sync_section_roster(lti_integration, lti_section, nrps_section)
      had_changes = false
      nrps_members = nrps_section[:members]
      client_id = lti_integration.client_id
      issuer = lti_integration.issuer
      section = lti_section.section
      current_students = Set.new
      current_teachers = Set.new
      instructor_list = []

      nrps_members.each do |nrps_member|
        account_type = Policies::Lti.get_account_type(nrps_member[:roles])

        user = Queries::Lti.get_user_from_nrps(
          client_id: client_id,
          issuer: issuer,
          nrps_member: nrps_member
        )
        user ||= initialize_lti_user_from_nrps(
          client_id: client_id,
          issuer: issuer,
          nrps_member: nrps_member
        )
        user_was_new = user.new_record?
        had_changes ||= (user_was_new || user.changed?)
        user.save!
        if user_was_new
          Metrics::Events.log_event(
            user: user,
            event_name: 'lti_user_created',
            metadata: {
              lms_name: lti_integration[:platform_name],
              context: 'roster_sync'
            }
          )
        end
        if account_type == ::User::TYPE_TEACHER
          # Skip adding the instructor and reporting changes if the user is already an instructor
          unless section.instructors.include?(user)
            add_instructor_result = section.add_instructor(user)
            had_changes ||= add_instructor_result
          end
          current_teachers.add(user.id)
          instructor_list << {
            name: user.name,
            id: user.id,
            isOwner: user.id == section.user_id,
          }
        else
          add_student_result = section.add_student(user)
          had_changes ||= add_student_result == Section::ADD_STUDENT_SUCCESS
          current_students.add(user.id)
        end
      end

      # Prune students who have been removed from the section in the LMS
      lti_section.followers.each do |follower|
        unless current_students.include?(follower.student_user_id)
          follower.destroy
          had_changes = true
        end
      end

      # Prune teachers who have been removed from the section in the LMS
      section.section_instructors.each do |section_instructor|
        instructor = section_instructor.instructor
        unless current_teachers.include?(instructor.id)
          section.remove_instructor(instructor)
          had_changes = true
        end
      end

      {
        had_changes: had_changes,
        size: current_students.size,
        name: lti_section.section.name,
        short_name: nrps_section[:short_name],
        instructors: instructor_list,
        lti_section_id: lti_section.id,
      }
    end

    # Syncs a course and all its sections from an NRPS response.
    def self.sync_course_roster(lti_integration:, lti_course:, nrps_sections:, current_user:)
      had_changes = false
      course_sync_result = {
        all: {},
        changed: {}
      }
      lti_sections = LtiSection.where(lti_course_id: lti_course.id)

      # Prune sections that have been deleted in the LMS
      lti_sections.each do |lti_section|
        unless nrps_sections.key?(lti_section.lms_section_id)
          lti_section.destroy unless nrps_sections.key?(lti_section.lms_section_id)
          had_changes = true
        end
      end

      nrps_sections.each do |lms_section_id, nrps_section|
        section_name = nrps_section[:name]
        # Check if lti_sections already contains a section with this lms_section_id
        lti_section = lti_sections.find_by(lms_section_id: lms_section_id)

        lti_user_type = lti_user_type(current_user, lti_integration, nrps_section)

        # Skip if the current user is not an instructor within this section
        next unless lti_user_type == ::User::TYPE_TEACHER

        if lti_section.nil?
          section = Section.new(
            {
              user_id: current_user.id,
              name: section_name,
              login_type: Section::LOGIN_TYPE_LTI_V1,
            }
          )
          lti_section = LtiSection.create(lti_course_id: lti_course.id, lms_section_id: lms_section_id, section: section)

          metadata = {'lms_name' => lti_integration.platform_name}
          Metrics::Events.log_event(
            user: current_user,
            event_name: 'lti_section_created',
            metadata: metadata,
          )

          had_changes = true
        end

        unless lti_section.section.name == section_name
          lti_section.section.update(name: section_name)
          had_changes = true
        end
        current_section_result = sync_section_roster(lti_integration, lti_section, nrps_sections[lms_section_id])
        had_changes ||= current_section_result[:had_changes]
        course_sync_result[:all][lms_section_id] = current_section_result
        if current_section_result[:had_changes]
          course_sync_result[:changed][lms_section_id] = current_section_result
        end
      end
      course_sync_result
    end

    def self.initialize_lms_landing_session(session, lti_provider_name, new_cta_type, user_type)
      session[:lms_landing] = {
        lti_provider_name: lti_provider_name,
        new_cta_type: new_cta_type,
        user_type: user_type,
      }
    end
  end
end
