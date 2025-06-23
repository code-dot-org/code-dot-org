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
end
