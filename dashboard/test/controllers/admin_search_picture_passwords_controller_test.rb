require 'test_helper'

class AdminSearchPicturePasswordsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers
  tests AdminSearchController

  setup do
    @admin = create(:admin)
    @section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
    @original_picture = SecretPicture.first
    @picture = SecretPicture.where.not(id: @original_picture.id).first
    @students = create_list(:student, 2, secret_picture: @original_picture)
    @students.each {|student| create(:follower, section: @section, student_user: student)}
    sign_in @admin
  end

  test 'section lookup displays picture choices without changing passwords' do
    post :lookup_section, params: {section_code: @section.code}

    assert_response :success
    assert_select 'h2', 'Set picture passwords'
    assert_select 'input[type=radio][name=secret_picture_id]', SecretPicture.count
    assert_select "label[for=secret_picture_id_#{@picture.id}]" do
      assert_select 'img[src=?]', @controller.view_context.image_path(@picture.path)
    end
    assert_equal [@original_picture.id], @students.map {|student| student.reload.secret_picture_id}.uniq
  end

  test 'unknown section shows an error without an update form' do
    get :lookup_section, params: {section_code: 'missing'}

    assert_select '.alert-danger', 'Section code not found'
    assert_select 'input[name=secret_picture_id]', 0
  end

  test 'deleted section shows undelete action without picture choices' do
    @section.destroy!
    post :lookup_section, params: {section_code: @section.code}

    assert_select '.alert-danger', 'Section is deleted'
    assert_select 'form[action$=?]', undelete_section_admin_search_index_path
    assert_select 'input[name=secret_picture_id]', 0
  end

  test 'sets passwords only for active followers and leaves other credentials unchanged' do
    outsider = create(:student, secret_picture: @original_picture)
    create(:follower, student_user: outsider)
    former_student = create(:student, secret_picture: @original_picture)
    create(:follower, section: @section, student_user: former_student).destroy!
    create(:follower, section: create(:section), student_user: @students.first)
    original_words = @students.map(&:secret_words)
    teacher_picture = @section.user.secret_picture_id

    CDO.log.expects(:warn).with do |message|
      payload = JSON.parse(message)
      payload['event'] == 'set_section_picture_passwords' &&
        payload['authenticated_user_id'] == @admin.id &&
        payload['section_id'] == @section.id &&
        payload['affected_user_ids'].sort == @students.map(&:id).sort &&
        payload['updated_user_count'] == 2
    end

    post :set_section_picture_passwords, params: {section_code: @section.code, secret_picture_id: @picture.id}

    assert_redirected_to lookup_section_admin_search_index_path(section_code: @section.code)
    assert_equal([@picture.id, @picture.id], @students.map {|student| student.reload.secret_picture_id})
    assert_equal original_words, @students.map(&:secret_words)
    assert_equal @original_picture.id, outsider.reload.secret_picture_id
    assert_equal @original_picture.id, former_student.reload.secret_picture_id
    assert_equal teacher_picture, @section.user.reload.secret_picture_id
    assert_match '2 users', flash[:notice]
    @students.each do |student|
      assert_equal student, User.authenticate_with_section(section: @section, params: {user_id: student.id, secret_picture_id: @picture.id})
      assert_nil User.authenticate_with_section(section: @section, params: {user_id: student.id, secret_picture_id: @original_picture.id})
    end
  end

  test 'rejects missing and invalid pictures without changing passwords' do
    [nil, '', '0', "#{@picture.id}invalid"].each do |picture_id|
      post :set_section_picture_passwords, params: {section_code: @section.code, secret_picture_id: picture_id}

      assert_response :unprocessable_entity
      assert_select '.alert-danger', 'Choose a valid picture.'
      assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
    end
  end

  test 'rejects missing unknown and deleted sections without changing passwords' do
    deleted_section = create(:section)
    deleted_section.destroy!

    [nil, '', 'missing', deleted_section.code, @section.id.to_s].each do |code|
      post :set_section_picture_passwords, params: {section_code: code, secret_picture_id: @picture.id}

      assert_response :unprocessable_entity
      assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
    end
  end

  test 'empty section reports zero users' do
    empty_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
    post :set_section_picture_passwords, params: {section_code: empty_section.code, secret_picture_id: @picture.id}

    assert_response :redirect
    assert_match '0 users', flash[:notice]
  end

  [Section::LOGIN_TYPE_WORD, Section::LOGIN_TYPE_EMAIL].each do |login_type|
    test "#{login_type} sections do not show picture password choices" do
      @section.update!(login_type: login_type)
      post :lookup_section, params: {section_code: @section.code}

      assert_response :success
      assert_select 'form[action=?]', set_section_picture_passwords_admin_search_index_path, count: 0
      assert_select 'input[name=secret_picture_id]', 0
    end

    test "#{login_type} sections reject picture password updates" do
      @section.update!(login_type: login_type)
      CDO.log.expects(:warn).never
      post :set_section_picture_passwords, params: {section_code: @section.code, secret_picture_id: @picture.id}

      assert_response :unprocessable_entity
      assert_select '.alert-danger', 'Picture passwords can only be set for picture-password sections.'
      assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
    end
  end

  test 'non-admin cannot update passwords' do
    sign_in @section.user
    post :set_section_picture_passwords, params: {section_code: @section.code, secret_picture_id: @picture.id}

    assert_response :forbidden
    assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
  end

  test 'signed-out user cannot update passwords' do
    sign_out @admin
    post :set_section_picture_passwords, params: {section_code: @section.code, secret_picture_id: @picture.id}

    assert_redirected_to_sign_in
    assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
  end

  [:student, :levelbuilder, :facilitator, :workshop_admin, :project_validator].product([:html, :json]).each do |role, format|
    test "#{role} cannot update passwords through #{format}" do
      sign_in create(role)
      Section.expects(:with_deleted).never
      CDO.log.expects(:warn).never

      post :set_section_picture_passwords, format: format, params: {
        section_code: @section.code,
        secret_picture_id: @picture.id,
        admin: true,
        user_id: @admin.id
      }

      assert_response :forbidden
      assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
    end
  end

  test 'an admin impersonating a teacher cannot update passwords' do
    sign_in @section.user
    session[:admin_id] = @admin.id
    session[:assumed_identity] = true
    Section.expects(:with_deleted).never

    post :set_section_picture_passwords, params: {section_code: @section.code, secret_picture_id: @picture.id}

    assert_response :forbidden
  end

  [nil, 'invalid-token'].each do |token|
    test "admin update rejects #{token ? 'invalid' : 'missing'} CSRF token" do
      with_forgery_protection do
        Section.expects(:with_deleted).never
        assert_raises(ActionController::InvalidAuthenticityToken) do
          post :set_section_picture_passwords, params: {
            section_code: @section.code,
            secret_picture_id: @picture.id,
            authenticity_token: token
          }
        end
        assert_equal([@original_picture.id, @original_picture.id], @students.map {|student| student.reload.secret_picture_id})
      end
    end
  end

  test 'admin update accepts the CSRF token from the picture form' do
    with_forgery_protection do
      get :lookup_section, params: {section_code: @section.code}
      form = css('form').find {|element| element['action'] == set_section_picture_passwords_admin_search_index_path}
      token = form.at_css('input[name=authenticity_token]')['value']
      assert token.present?

      # Controller tests retain PATH_INFO between requests, but CSRF tokens are scoped to the form action.
      @request.delete_header('PATH_INFO')
      post :set_section_picture_passwords, params: {
        section_code: @section.code,
        secret_picture_id: @picture.id,
        authenticity_token: token
      }

      assert_redirected_to lookup_section_admin_search_index_path(section_code: @section.code)
      assert_equal([@picture.id, @picture.id], @students.map {|student| student.reload.secret_picture_id})
    end
  end

  test 'picture password selection is filtered from request logs' do
    filter = ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters)
    assert_equal '[FILTERED]', filter.filter('secret_picture_id' => @picture.id)['secret_picture_id']
  end

  private def with_forgery_protection
    previous = ActionController::Base.allow_forgery_protection
    ActionController::Base.allow_forgery_protection = true
    yield
  ensure
    ActionController::Base.allow_forgery_protection = previous
  end
end
