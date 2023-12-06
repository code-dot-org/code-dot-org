require 'test_helper'
require 'user'
require 'authentication_option'
require 'policies/lti'

class Services::LtiTest < ActionDispatch::IntegrationTest
  setup do
    @roles_key = Policies::Lti::LTI_ROLES_KEY
    @custom_claims_key = Policies::Lti::LTI_CUSTOM_CLAIMS
    @teacher_roles = [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#User',
    ]
    @lti_integration = create :lti_integration
    @student_role = Policies::Lti::CONTEXT_LEARNER_ROLE

    @id_token = {
      sub: SecureRandom.uuid,
      aud: @lti_integration[:client_id],
      iss: @lti_integration[:issuer],
      @custom_claims_key => {
        display_name: 'hansolo',
        full_name: 'Han Solo',
        given_name: 'Han',
        family_name: 'Solo',
      }
    }

    @nrps_student = {
      status: 'Active',
      user_id: SecureRandom.uuid,
      roles: [@student_role],
      message: [{
        @custom_claims_key => {
          display_name: 'hansolo',
          full_name: 'Han Solo',
          given_name: 'Han',
          family_name: 'Solo',
          email: 'foo@test.com'
        }
      }],
    }.deep_symbolize_keys

    @lms_section_ids = [1, 2, 3]
    @lms_section_names = ['Section 1', 'Section 2', 'Section 3']

    @nrps_full_response = {
      id: "https://codeorg.instructure.com/api/lti/courses/115/names_and_roles?rlid=foo-id",
      context: {
        id: "context-id",
        label: "Course Label",
        title: "Course Title"
      },
      members: [
        {
          status: "Active",
          user_id: "user-id-1",
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"],
          message: [
            {
              'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
              locale: "en",
              'https://purl.imsglobal.org/spec/lti/claim/custom': {
                email: "teacher@code.org",
                course_id: "115",
                full_name: "Test Teacher",
                given_name: "Test",
                family_name: "Teacher",
                section_ids: @lms_section_ids.join(','),
                display_name: "Test Teacher",
                section_names: @lms_section_names.to_s
              },
            }
          ]
        },
        {
          status: "Active",
          user_id: SecureRandom.uuid,
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
          message: [
            {
              'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
              locale: "en",
              'https://purl.imsglobal.org/spec/lti/claim/custom': {
                email: "student0@code.org",
                course_id: "115",
                full_name: "Test Zero",
                given_name: "Test",
                family_name: "Zero",
                section_ids: @lms_section_ids.join(','),
                display_name: "Test Zero",
                section_names: @lms_section_names.to_s
              },
            }
          ]
        },
        {
          status: "Active",
          user_id: SecureRandom.uuid,
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
          message: [
            {
              'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
              locale: "en",
              'https://purl.imsglobal.org/spec/lti/claim/custom': {
                email: "student1@code.org",
                course_id: "115",
                full_name: "Test One",
                given_name: "Test",
                family_name: "One",
                section_ids: @lms_section_ids.join(','),
                display_name: "Test One",
                section_names: @lms_section_names.to_s
              },
            }
          ]
        },
        {
          status: "Active",
          user_id: SecureRandom.uuid,
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
          message: [
            {
              'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
              locale: "en",
              'https://purl.imsglobal.org/spec/lti/claim/custom': {
                email: "test2@code.org",
                course_id: "115",
                full_name: "Test Two",
                given_name: "Test",
                family_name: "Two",
                section_ids: @lms_section_ids.join(','),
                display_name: "Test Two",
                section_names: @lms_section_names.to_s
              },
            }
          ]
        }
      ]
    }.deep_symbolize_keys
  end

  test 'initialize_lti_user should create User::TYPE_TEACHER when id_token contains teacher/admin roles' do
    @id_token[@roles_key] = @teacher_roles
    user = Services::Lti.initialize_lti_user(@id_token)
    assert user
    assert_equal user.user_type, User::TYPE_TEACHER
    assert_equal user.name, @id_token[@custom_claims_key][:display_name]

    @id_token[@custom_claims_key][:display_name] = nil
    user = Services::Lti.initialize_lti_user(@id_token)
    assert_equal user.name, @id_token[@custom_claims_key][:full_name]

    @id_token[@custom_claims_key][:full_name] = nil
    user = Services::Lti.initialize_lti_user(@id_token)
    assert_equal user.name, @id_token[@custom_claims_key][:family_name]

    @id_token[@custom_claims_key][:family_name] = nil
    user = Services::Lti.initialize_lti_user(@id_token)
    assert_equal user.name, @id_token[@custom_claims_key][:given_name]

    refute user.authentication_options.empty?
    assert_equal user.authentication_options[0].credential_type, AuthenticationOption::LTI_V1
    assert_equal user.authentication_options[0].authentication_id, Policies::Lti.generate_auth_id(@id_token)
  end

  test 'initialize_lti_user should create User::TYPE_STUDENT when id_token contains student roles' do
    @id_token[@roles_key] = ['not-a-teacher-role']
    student_user = Services::Lti.initialize_lti_user(@id_token)
    assert student_user
    assert_equal student_user.user_type, User::TYPE_STUDENT
    assert_equal student_user.name, @id_token[@custom_claims_key][:display_name]
    assert_equal student_user.family_name, @id_token[@custom_claims_key][:family_name]

    @id_token[@custom_claims_key][:display_name] = nil
    student_user = Services::Lti.initialize_lti_user(@id_token)
    assert_equal student_user.name, @id_token[@custom_claims_key][:full_name]

    @id_token[@custom_claims_key][:full_name] = nil
    student_user = Services::Lti.initialize_lti_user(@id_token)
    assert_equal student_user.name, @id_token[@custom_claims_key][:given_name]
  end

  test 'create_lti_user_identity should create an LtiUserIdentity when given LTI User' do
    lti_integration = create :lti_integration
    auth_id = "#{lti_integration[:issuer]}|#{lti_integration[:client_id]}|#{SecureRandom.alphanumeric}"
    user = build :student
    user.authentication_options << build(:lti_authentication_option, user: user, authentication_id: auth_id)
    user.save

    lti_user_identity = Services::Lti.create_lti_user_identity(user)
    assert lti_user_identity
  end

  test 'should create a student user given an LTI NRPS member object' do
    student_user = Services::Lti.initialize_lti_student_from_nrps(client_id: @id_token[:aud], issuer: @id_token[:iss], nrps_member: @nrps_student)
    assert student_user
    assert_equal student_user.user_type, User::TYPE_STUDENT
  end

  test 'should parse the members response from NRPS and return a hash of sections' do
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response)
    assert_empty parsed_response.keys - @lms_section_ids.map(&:to_s)
    parsed_response.each do |_, v|
      assert_empty v.keys - [:name, :members]
      assert_equal v[:members].length, 3
    end
  end

  test 'should add or remove student users when syncing a section' do
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration
    lti_section = create :lti_section, lti_course: lti_course
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response)
    members = parsed_response[@lms_section_ids.first.to_s][:members]

    # Create and add brand new users
    Services::Lti.sync_section_roster(lti_integration, lti_section, members)
    assert_equal lti_section.followers.length, 3

    # Remove a user
    user_to_remove = lti_section.followers.last
    Services::Lti.sync_section_roster(lti_integration, lti_section, members[0...-1])
    assert_equal lti_section.reload.followers.length, 2

    # Find an existing user add them back in
    Services::Lti.sync_section_roster(lti_integration, lti_section, members)
    assert_equal lti_section.reload.followers.length, 3
    assert_equal lti_section.followers.last, user_to_remove
  end

  test 'should add or remove sections when syncing a course' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response)
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, section_owner_id: teacher.id)

    # Adding new sections
    assert lti_course.reload.sections.length, 3

    # Removing old sections
    parsed_response.delete(@lms_section_ids.first.to_s)
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, section_owner_id: teacher.id)
    assert lti_course.reload.sections.length, 2
  end
end
