require 'test_helper'

class Services::LtiTest < ActiveSupport::TestCase
  setup do
    @roles_key = Policies::Lti::LTI_ROLES_KEY
    @custom_claims_key = Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym
    @teacher_roles = [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#User',
    ]
    @lti_integration = create :lti_integration
    @student_role = Policies::Lti::CONTEXT_LEARNER_ROLE
    @observer_role = Policies::Lti::CONTEXT_MENTOR_ROLE
    @teacher_role = Policies::Lti::TEACHER_ROLES.first

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

    @nrps_teacher = {
      status: 'Active',
      user_id: SecureRandom.uuid,
      roles: [@teacher_role],
      message: [{
        @custom_claims_key => {
          display_name: 'teacher',
          full_name: 'Test Teacher',
          email: 'test-teacher@code.org'
        }
      }],
    }.deep_symbolize_keys

    @nrps_observer = {
      status: 'Active',
      user_id: SecureRandom.uuid,
      roles: [@observer_role],
      message: [{
        @custom_claims_key => {
          display_name: 'parent',
          full_name: 'Test Parent',
          email: 'test-parent@code.org'
        }
      }],
    }.deep_symbolize_keys

    @course_name = 'Test Course'
    @lms_section_ids = [1, 2, 3]
    @lms_section_names = ['Section 1', 'Section 2', 'Section 3']

    @nrps_full_response = {
      id: "https://codeorg.instructure.com/api/lti/courses/115/names_and_roles?rlid=foo-id",
      context: {
        id: "context-id",
        label: "Course Label",
        title: @course_name,
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
          user_id: "teacher-2",
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"],
          message: [
            {
              'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
              locale: "en",
              'https://purl.imsglobal.org/spec/lti/claim/custom': {
                email: "teacher2@code.org",
                course_id: "115",
                full_name: "Test Teacher2",
                given_name: "Test",
                family_name: "Teacher2",
                section_ids: @lms_section_ids.join(','),
                display_name: "Test Teacher2",
                section_names: @lms_section_names.to_s
              },
            }
          ]
        },
        {
          status: "Active",
          user_id: "student-0",
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
          user_id: "observer-0",
          roles: [Policies::Lti::CONTEXT_MENTOR_ROLE],
          message: [
            {
              'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
              locale: "en",
              'https://purl.imsglobal.org/spec/lti/claim/custom': {
                email: "parent-0@code.org",
                course_id: "115",
                full_name: "Parent Zero",
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

    @nrps_response_no_rlid_provided = {
      id: "https://lti-service.svc.schoology.com/lti-service/tool/115/services/names-roles/v2p0/membership/115",
      context: {
        id: "115",
        title: @course_name,
        label: nil
      },
      members: [
        {
          status: "Active",
          name: "Test Teacher",
          given_name: "Test",
          family_name: "Teacher",
          email: "teacher@code.org",
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"],
          user_id: 'user-id-1'
        },
        {
          status: "Active",
          name: "Test Zero",
          given_name: "Test",
          family_name: "Zero",
          email: "test0@code.org",
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
          user_id: SecureRandom.uuid
        },
        {
          status: "Active",
          name: "Test One",
          given_name: "Test",
          family_name: "One",
          email: "test1@code.org",
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
          user_id: SecureRandom.uuid
        },
        {
          status: "Active",
          name: "Test Two",
          given_name: "Test",
          family_name: "Two",
          email: "test2@code.org",
          roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
          user_id: SecureRandom.uuid
        }
      ]
    }.deep_symbolize_keys

    @empty_sync_result = {
      all: {},
      changed: {},
    }
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
    assert_equal user.authentication_options[0].authentication_id, Services::Lti::AuthIdGenerator.new(@id_token).call
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

  test 'create_lti_integration should create an LtiIntegration when given valid inputs' do
    name = "name"
    client_id = 'client_id'
    issuer = 'issuer'
    platform_name = 'platform_name'
    auth_redirect_url = 'auth_redirect_url'
    jwks_url = 'jwks_url'
    access_token_url = 'access_token_url'
    admin_email = 'admin_email'

    integration = Services::Lti.create_lti_integration(
      name: name,
      client_id: client_id,
      issuer: issuer,
      platform_name: platform_name,
      auth_redirect_url: auth_redirect_url,
      jwks_url: jwks_url,
      access_token_url: access_token_url,
      admin_email: admin_email
    )

    assert integration
  end

  test 'create_lti_deployment should create an LtiDeloyment when given valid inputs' do
    deployment_id = SecureRandom.uuid
    integration = create :lti_integration

    deployment = Services::Lti.create_lti_deployment(integration.id, deployment_id)

    assert deployment
  end

  test 'should create a student user given an LTI NRPS member object' do
    user = Services::Lti.initialize_lti_user_from_nrps(client_id: @id_token[:aud], issuer: @id_token[:iss], nrps_member: @nrps_student)
    assert user
    assert_equal user.user_type, User::TYPE_STUDENT
  end

  test 'should create a student user if LTI does not provide email despite instructor role' do
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    @nrps_teacher[:message].first.delete(@custom_claims_key)

    user = Services::Lti.initialize_lti_user_from_nrps(client_id: @id_token[:aud], issuer: @id_token[:iss], nrps_member: @nrps_teacher)
    assert user
    assert_equal user.user_type, User::TYPE_STUDENT
  end

  test 'should create a teacher user given an LTI NRPS member object' do
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    user = Services::Lti.initialize_lti_user_from_nrps(client_id: @id_token[:aud], issuer: @id_token[:iss], nrps_member: @nrps_teacher)
    assert user
    assert_equal user.user_type, User::TYPE_TEACHER
    assert_equal "test-teacher@code.org", user.email
    assert_nil user.family_name
    assert_equal user.lti_roster_sync_enabled, true
  end

  test 'should create a new teacher even if an account already exists with their email' do
    auth_id = "#{@lti_integration[:issuer]}|#{@lti_integration[:client_id]}|user-id-1"
    user = create :teacher
    create :lti_authentication_option, user: user, authentication_id: auth_id

    section = create :section, user: user

    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create(:lti_section, lti_course: lti_course, section: section)
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    nrps_section = parsed_response[@lms_section_ids.first.to_s]

    create :teacher, email: @nrps_full_response.dig(:members, 1, :message, 0, @custom_claims_key, :email)

    Services::Lti.sync_section_roster(@lti_integration, lti_section, nrps_section)
    assert_equal lti_section.followers.length, 3
  end

  test 'should parse the members response from NRPS and return a hash of sections' do
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    assert_empty parsed_response.keys - @lms_section_ids.map(&:to_s)
    parsed_response.each do |_, v|
      assert_empty v.keys - [:name, :short_name, :members]
      assert_equal v[:members].length, 5
    end
  end

  test 'should parse the members response from NRPS with no resource link provided and return a hash of sections' do
    parsed_response = Services::Lti.parse_nrps_response(@nrps_response_no_rlid_provided, @id_token[:iss])
    assert_equal parsed_response.keys.length, 1
    parsed_response.each do |_, v|
      assert_empty v.keys - [:name, :short_name, :members]
      assert_equal v[:members].length, 4
    end
  end

  test 'should append the course name to each section name when parsing NRPS response' do
    expected_section_names = @lms_section_names.map {|name| "#{@course_name}: #{name}"}
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    actual_section_names = parsed_response.values.map {|v| v[:name]}
    assert_empty expected_section_names - actual_section_names
  end

  test 'course name should match section name when parsing NRPS response with no resource link provided' do
    expected_section_name = [@course_name]
    parsed_response = Services::Lti.parse_nrps_response(@nrps_response_no_rlid_provided, @id_token[:iss])
    actual_section_name = parsed_response.values.map {|v| v[:name]}
    assert_empty expected_section_name - actual_section_name
  end

  test 'should update a section name if it has changed' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    create :lti_user_identity, lti_integration: lti_integration, user: teacher, subject: 'user-id-1'
    lti_course = create :lti_course, lti_integration: lti_integration
    section = create :section, user: teacher

    create :lti_section, lti_course: lti_course, section: section
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)

    # initial names
    expected_section_names = @lms_section_names.map {|name| "#{@course_name}: #{name}"}
    actual_section_names = lti_course.sections.map(&:name)
    assert_empty expected_section_names - actual_section_names

    # re-sync with new names
    new_names = ['Renamed 1', 'Renamed 2', 'Renamed 3'].to_s
    new_response = @nrps_full_response.deep_dup
    new_response[:members].each do |member|
      member[:message][0][@custom_claims_key][:section_names] = new_names
    end
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(new_response, @id_token[:iss])
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)
    new_expected_names = JSON.parse(new_names).map {|name| "#{@course_name}: #{name}"}
    actual_section_names = lti_course.reload.sections.map(&:name)
    assert_empty new_expected_names - actual_section_names
  end

  test 'should add or remove student users when syncing a section' do
    auth_id = "#{@lti_integration[:issuer]}|#{@lti_integration[:client_id]}|user-id-1"
    user = create :teacher
    create :lti_authentication_option, user: user, authentication_id: auth_id

    section = create :section, user: user

    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create(:lti_section, lti_course: lti_course, section: section)
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    nrps_section = parsed_response[@lms_section_ids.first.to_s]

    # Create and add brand new users
    Services::Lti.sync_section_roster(@lti_integration, lti_section, nrps_section)
    assert_equal lti_section.followers.length, 3

    # Remove a user
    user_to_remove = lti_section.followers.last
    section_one_less_user = parsed_response[@lms_section_ids.first.to_s].clone
    section_one_less_user[:members] = section_one_less_user[:members][0...-1]
    Services::Lti.sync_section_roster(@lti_integration, lti_section, section_one_less_user)
    assert_equal lti_section.reload.followers.length, 2

    # Find an existing user add them back in
    Services::Lti.sync_section_roster(@lti_integration, lti_section, nrps_section)
    assert_equal lti_section.reload.followers.length, 3
    assert_equal lti_section.followers.last, user_to_remove
  end

  test 'should convert co-teacher to student in the section if LTI role changes' do
    auth_id = "#{@lti_integration[:issuer]}|#{@lti_integration[:client_id]}|user-id-1"
    user = create :teacher
    co_teacher = create :teacher
    create :lti_authentication_option, user: user, authentication_id: auth_id
    create :lti_authentication_option, user: co_teacher, authentication_id: "#{@lti_integration[:issuer]}|#{@lti_integration[:client_id]}|student-0"
    create :lti_user_identity, lti_integration: @lti_integration, user: user, subject: 'user-id-1'
    create :lti_user_identity, lti_integration: @lti_integration, user: co_teacher, subject: 'student-0'

    section = create :section, user: user
    co_teacher_si = create(:section_instructor, section: section, instructor: co_teacher, status: :active)

    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create(:lti_section, lti_course: lti_course, section: section)
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    nrps_section = parsed_response[@lms_section_ids.first.to_s]

    Services::Lti.sync_section_roster(@lti_integration, lti_section, nrps_section)

    co_teacher_si.reload

    assert_equal 2, lti_section.followers.length
    assert_equal true, co_teacher_si.deleted?
  end

  test 'should convert student to co-teacher in the section if LTI role changes' do
    auth_id = "#{@lti_integration[:issuer]}|#{@lti_integration[:client_id]}|user-id-1"
    user = create :teacher
    student = create :teacher # a teacher can be a "student" in a section
    create :lti_authentication_option, user: user, authentication_id: auth_id
    create :lti_authentication_option, user: student, authentication_id: "#{@lti_integration[:issuer]}|#{@lti_integration[:client_id]}|teacher-2"
    create :lti_user_identity, lti_integration: @lti_integration, user: user, subject: 'user-id-1'
    create :lti_user_identity, lti_integration: @lti_integration, user: student, subject: 'teacher-2'

    section = create :section, user: user
    section.add_student(student)

    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create(:lti_section, lti_course: lti_course, section: section)
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    nrps_section = parsed_response[@lms_section_ids.first.to_s]

    Services::Lti.sync_section_roster(@lti_integration, lti_section, nrps_section)

    co_teacher_si = SectionInstructor.find_by(instructor: student, section_id: section.id)

    assert_equal 3, lti_section.followers.length
    assert_equal true, co_teacher_si.present?
    assert_equal student, co_teacher_si.instructor
  end

  test 'should not sync if the current user is not the section owner' do
    teacher = build :teacher
    teacher.authentication_options << build(:lti_authentication_option, user: teacher)
    teacher.save
    different_teacher = create :teacher

    lti_course = create :lti_course, lti_integration: @lti_integration
    create :lti_section, lti_course: lti_course
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])

    # Sync once as the section owner
    Services::Lti.sync_course_roster(lti_integration: @lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)
    assert lti_course.reload.sections.length, 3

    # Sync again as a different teacher with the section deleted (it should not delete)
    parsed_response.delete(@lms_section_ids.first.to_s)
    Services::Lti.sync_course_roster(lti_integration: @lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: different_teacher)
    assert lti_course.reload.sections.length, 3

    # The same deletion as section owner should delete
    Services::Lti.sync_course_roster(lti_integration: @lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)
    assert lti_course.reload.sections.length, 2
  end

  test 'should add or remove sections when syncing a course' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    create :lti_user_identity, lti_integration: lti_integration, user: teacher
    lti_course = create :lti_course, lti_integration: lti_integration
    create :lti_section, lti_course: lti_course
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)

    # Adding new sections
    assert lti_course.reload.sections.length, 3

    # Removing old sections
    parsed_response.delete(@lms_section_ids.first.to_s)
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)
    assert lti_course.reload.sections.length, 2

    # Remove empty sections with no users
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)
    assert lti_course.reload.sections.length, 1
  end

  test 'should remove empty sections when syncing a course' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    create :lti_user_identity, lti_integration: lti_integration, user: teacher
    lti_course = create :lti_course, lti_integration: lti_integration
    create :lti_section, lti_course: lti_course
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)

    assert lti_course.reload.sections.length, 3

    # Remove empty sections with no users
    @nrps_full_response[:members] = []
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)
    assert lti_course.reload.sections.length, 2
  end

  test 'should NOT sync if the user is not a teacher on the LMS' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    create :lti_user_identity, lti_integration: lti_integration, user: teacher, subject: 'user-id-2'
    lti_course = create :lti_course, lti_integration: lti_integration
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    parsed_response = Services::Lti.parse_nrps_response(@nrps_full_response, @id_token[:iss])
    result = Services::Lti.sync_course_roster(lti_integration: lti_integration, lti_course: lti_course, nrps_sections: parsed_response, current_user: teacher)

    assert_equal @empty_sync_result, result
  end

  test 'lti_user_roles should return the LTI roles for a given user' do
    roles = Services::Lti.lti_user_roles(@nrps_full_response, "user-id-1")

    assert_equal ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"], roles
  end

  test 'lti_user_roles should return nil if the user cannot be found' do
    roles = Services::Lti.lti_user_roles(@nrps_full_response, "unknown")

    assert_nil roles
  end

  test 'lti_user_type should return teacher if LTI user role is instructor' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    create :lti_user_identity, lti_integration: lti_integration, user: teacher, subject: 'user-id-1'
    user_type = Services::Lti.lti_user_type(teacher, lti_integration, @nrps_full_response)

    assert_equal User::TYPE_TEACHER, user_type
  end

  test 'lti_user_type should return student if LTI user role is not instructor' do
    teacher = create :teacher
    lti_integration = create :lti_integration
    create :lti_user_identity, lti_integration: lti_integration, user: teacher, subject: 'user-id-2'
    user_type = Services::Lti.lti_user_type(teacher, lti_integration, @nrps_full_response)

    assert_equal User::TYPE_STUDENT, user_type
  end
end
