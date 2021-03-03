require 'test_helper'

class AdminSearchControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')

    @teacher = create(:teacher)
    @teacher_section = create(:section, user: @teacher)
  end

  # Confirm the permissioning on these pages is admin-only.
  generate_admin_only_tests_for :find_students
  generate_admin_only_tests_for :lookup_section

  #
  # find_student tests
  #

  test 'find_students flashes warning if multiple teachers match' do
    create_list :teacher, 2, name: 'multiple'

    get :find_students, params: {teacherNameFilter: 'multiple'}

    assert_response :success
    assert_select '.container .alert-danger', 'Multiple teachers matched the name and email search criteria.'
  end

  test 'find_students flashes warning for nil section' do
    get :find_students, params: {sectionFilter: 'AAAAAA'}

    assert_response :success
    assert_select '.container .alert-danger', 'Section not found.'
  end

  test 'find_students flashes warning for deleted section' do
    section = create :section
    section.destroy

    get :find_students, params: {sectionFilter: section.code}

    assert_response :success
    assert_select '.container .alert-danger', 'Section is deleted.'
  end

  #
  # undelete_section tests
  #

  test "undelete_section is admin only" do
    sign_in(@not_admin)
    post :undelete_section, params: {section_code: @teacher_section.code}
    assert_response :forbidden
  end

  test "undelete_section should undelete deleted section" do
    @teacher_section.destroy
    post :undelete_section, params: {section_code: @teacher_section.code}
    assert_response :redirect
    refute @teacher_section.reload.deleted?
    assert_equal "Section (CODE: #{@teacher_section.code}) undeleted!",
      flash[:alert]
  end

  test "undelete_section should noop for non-deleted section" do
    code = @teacher_section.code
    post :undelete_section, params: {section_code: code}
    assert_response :redirect
    refute @teacher_section.reload.deleted?
    assert_equal "Section (CODE: #{code}) not found or undeleted.",
      flash[:alert]
  end

  test "undelete_section should recursively undelete" do
    follower = create :follower, section: @teacher_section
    follower.destroy
    @teacher_section.destroy

    assert_creates(Section, Follower) do
      assert_no_change("Section.with_deleted.count", "Follower.with_deleted.count") do
        post :undelete_section, params: {section_code: @teacher_section.code}

        refute follower.reload.deleted?
        refute @teacher_section.reload.deleted?
      end
    end
  end

  #
  # lookup_section tests
  #

  test "should lookup_section" do
    post :lookup_section, params: {section_code: @teacher_section.code}
    assert_select '#section_owner', 'Owner: ' + @teacher.email
  end

  test "should lookup_section error if not found" do
    post :lookup_section, params: {section_code: 'ZZZZ'}
    assert_response :success
    assert_select '.container .alert-danger', 'Section code not found'
  end

  test "should not lookup_section if not admin" do
    sign_in @not_admin
    post :lookup_section, params: {section_code: @teacher_section.code}
    assert_response :forbidden
  end

  test "should not lookup_section if not signed in" do
    sign_out @admin
    post :lookup_section, params: {section_code: @teacher_section.code}
    assert_redirected_to_sign_in
  end

  #
  # pilot experiment tests
  #

  test 'non-admin cannot view list of piloters' do
    sign_in @not_admin
    get :show_pilot, params: {pilot_name: 'csd-piloters'}
    assert_response :forbidden
  end

  test 'piloter shows up in list of piloters' do
    create :teacher, pilot_experiment: 'csd-piloters', email: 'csd@example.com'
    create :teacher, pilot_experiment: 'csp-piloters', email: 'csp@example.com'
    get :show_pilot, params: {pilot_name: 'csd-piloters'}
    assert_response :success
    assert_select 'table tr td', 1
    assert_select 'table tr td', 'csd@example.com'
  end

  #
  # add_to_pilot tests
  #

  test 'can add teacher to pilot' do
    teacher = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {email: teacher.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
  end

  test 'can add multiple teachers to pilot' do
    teacher = create :teacher
    teacher2 = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {email: teacher.email + "\n" + teacher2.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'can add multiple teachers to pilot with extra spaces' do
    teacher = create :teacher
    teacher2 = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {email: teacher.email + " \n" + teacher2.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'can add multiple teachers to pilot with extra commas' do
    teacher = create :teacher
    teacher2 = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {email: teacher.email + ",\n" + teacher2.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'if first email fails, second given will work successfully' do
    student = create :student
    teacher = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {email: student.email + "\n" + teacher.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: student.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
  end

  test 'if middle user is not found, first and third still work successfully' do
    teacher = create :teacher
    teacher2 = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {
      email: teacher.email + "\nfake@fakey1.fake\n" + teacher2.email, pilot_name: pilot_name
    }

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'longer list of emails works correctly' do
    teacher = create :teacher
    teacher2 = create :teacher
    teacher3 = create :teacher
    teacher4 = create :teacher
    teacher5 = create :teacher
    teacher6 = create :teacher
    teacher7 = create :teacher
    teacher8 = create :teacher
    teacher9 = create :teacher
    teacher10 = create :teacher
    teacher11 = create :teacher
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {
      email: teacher.email + "\n" + teacher2.email + "\n" + teacher3.email + "\n" +
      teacher4.email + "\n" + teacher5.email + "\n" + teacher6.email + "\n" +
      teacher7.email + "\n" + teacher8.email + "\n" + teacher9.email + "\n" +
      teacher10.email + "\n" + teacher11.email, pilot_name: pilot_name
    }

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher3.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher6.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher9.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher10.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher11.id, name: pilot_name).present?
  end

  test 'cannot add student to pilot' do
    student = create :student
    pilot_name = 'csd-piloters'
    post :add_to_pilot, params: {email: student.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: student.id, name: pilot_name).present?
  end

  test 'non-admin cannot add teacher to pilot' do
    teacher = create :teacher
    pilot_name = 'csd-piloters'

    sign_in @not_admin
    post :add_to_pilot, params: {email: teacher.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
  end
end
