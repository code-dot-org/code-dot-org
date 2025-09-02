require 'test_helper'

class SectionsControllerTest < ActionController::TestCase
  include Minitest::RSpecMocks

  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user_1 = create(:follower, section: @word_section).student_user

    @picture_section = create(:section, user: @teacher, login_type: 'picture')
    @picture_user_1 = create(:follower, section: @picture_section).student_user

    @regular_section = create(:section, user: @teacher, login_type: 'email')

    @flappy_section = create(:section, user: @teacher, login_type: 'word', script_id: Unit.flappy_unit.id)
    @flappy_user_1 = create(:follower, section: @flappy_section).student_user
  end

  setup do
    # Expect any scripts/courses to be assignable unless specified by test
    UnitGroup.stubs(:course_assignable?).returns(true)
    Unit.stubs(:course_assignable?).returns(true)

    # place in setup instead of setup_all otherwise course ends up being serialized
    # to a file if levelbuilder_mode is true
    @unit_group = create(:single_unit_course)
    @script_in_course = @unit_group.first_unit
    @section_with_course = create(:section, user: @teacher, login_type: 'word', course_id: @unit_group.id)
    @section_with_course_user_1 = create(:follower, section: @section_with_course).student_user

    @request.host = CDO.dashboard_hostname
  end

  test "do not show login screen for invalid section code" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: {id: @word_section.id} # we use code not id
    end
  end

  test "do not show login screen for non-picture/word sections" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: {id: @regular_section.code}
    end
  end

  test "show login screen for picture section" do
    get :show, params: {id: @picture_section.code}

    assert_response :success
  end

  test "show login screen for word section" do
    get :show, params: {id: @word_section.code}

    assert_response :success
  end

  test "valid log_in with picture" do
    assert_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: @picture_user_1.id,
        secret_picture_id: @picture_user_1.secret_picture_id
      }
    end

    assert_redirected_to '/'
  end

  test "invalid log_in with picture" do
    assert_no_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: @picture_user_1.id,
        secret_picture_id: @picture_user_1.secret_picture_id + 1
      }
    end

    assert_redirected_to section_path(id: @picture_section.code)
  end

  test "former picture section member cannot log in with picture" do
    former_picture_section_user = create(:follower, section: @picture_section).student_user
    follower = Follower.where(section: @picture_section.id, student_user_id: former_picture_section_user.id).first
    @picture_section.remove_student(former_picture_section_user, follower, {})

    assert_no_difference 'former_picture_section_user.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: former_picture_section_user.id,
        secret_picture_id: former_picture_section_user.secret_picture_id
      }
    end

    assert_redirected_to section_path(id: @picture_section.code)
  end

  test "valid log_in with word" do
    assert_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: @word_user_1.id,
        secret_words: @word_user_1.secret_words
      }
    end

    assert_redirected_to '/'
  end

  test "valid log_in with word without spaces" do
    assert_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: @word_user_1.id,
        secret_words: @word_user_1.secret_words.delete(' ')
      }
    end

    assert_redirected_to '/'
  end

  test "invalid log_in with word" do
    assert_no_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: @word_user_1.id,
        secret_words: "not correct"
      }
    end

    assert_redirected_to section_path(id: @word_section.code)
  end

  test "former word section member cannot log in with word" do
    former_word_section_user = create(:follower, section: @word_section).student_user
    follower = Follower.where(section: @word_section.id, student_user_id: former_word_section_user.id).first
    @word_section.remove_student(former_word_section_user, follower, {})

    assert_no_difference 'former_word_section_user.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: former_word_section_user.id,
        secret_words: former_word_section_user.secret_words
      }
    end

    assert_redirected_to section_path(id: @word_section.code)
  end

  test "login to section with a script redirects to script" do
    post :log_in, params: {
      id: @flappy_section.code,
      user_id: @flappy_user_1.id,
      secret_words: @flappy_user_1.secret_words
    }

    assert_redirected_to '/courses/flappy/units/1'
  end

  test "login to section with a course redirects to course" do
    post :log_in, params: {
      id: @section_with_course.code,
      user_id: @section_with_course_user_1.id,
      secret_words: @section_with_course_user_1.secret_words
    }

    assert_redirected_to "/courses/#{@section_with_course.unit_group.name}"
  end

  test "login to section with a modular script redirects to modular course" do
    modular_course = create(:single_unit_course, unit: @script_in_course)
    section_with_modular_script = create(:section, user: @teacher, login_type: 'word', course_id: modular_course.id, script_id: @script_in_course.id)
    section_with_modular_script_user_1 = create(:follower, section: section_with_modular_script).student_user

    post :log_in, params: {
      id: section_with_modular_script.code,
      user_id: section_with_modular_script_user_1.id,
      secret_words: section_with_modular_script_user_1.secret_words
    }

    assert_redirected_to "/courses/#{modular_course.name}/units/1"
  end

  test "login with show_pairing_dialog shows pairing dialog" do
    post :log_in, params: {
      id: @flappy_section.code,
      user_id: @flappy_user_1.id,
      secret_words: @flappy_user_1.secret_words,
      show_pairing_dialog: '1'
    }

    assert_redirected_to '/courses/flappy/units/1'

    assert session[:show_pairing_dialog]
  end

  test "login without show_pairing_dialog shows pairing dialog" do
    post :log_in, params: {
      id: @flappy_section.code,
      user_id: @flappy_user_1.id,
      secret_words: @flappy_user_1.secret_words
    }

    assert_redirected_to '/courses/flappy/units/1'

    refute session[:show_pairing_dialog]
  end

  test "cannot log in to section if you are not in the section" do
    assert_no_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: @word_user_1.id,
        secret_picture_id: @word_user_1.secret_picture_id
      }
    end

    assert_redirected_to section_path(id: @picture_section.code)
  end

  test_user_gets_response_for :new, params: {loginType: 'picture', participantType: 'student'}, user: nil, response: :redirect
  test_user_gets_response_for :new, params: {loginType: 'picture', participantType: 'student'}, user: :teacher, response: :success
  test_user_gets_response_for :new, params: {loginType: 'picture', participantType: 'student'}, user: :student, response: :forbidden
  test_user_gets_response_for :new, params: {loginType: 'picture', participantType: 'student'}, user: :admin, response: :success

  test "new redirects to home if loginType and participantType are not present" do
    user = create(:admin)
    sign_in user

    get :new
    assert_redirected_to '/home'

    get :new, params: {participantType: 'student'}
    assert_redirected_to '/home'

    get :new, params: {loginType: 'word'}
    assert_redirected_to '/home'

    get :new, params: {loginType: 'word', participantType: 'student'}
    assert_response :success
  end

  test 'redirect to teacher_dashboard from edit ' do
    sign_in @teacher

    get :edit, params: {id: @word_section.id}
    assert_redirected_to "/teacher_dashboard/sections/#{@word_section.id}/settings"
  end

  test 'returns forbidden if requested edit section does not belong to teacher' do
    sign_in @teacher
    other_teacher_section = create(:section)
    get :edit, params: {id: other_teacher_section.id}
    assert_response :forbidden
  end

  test 'archive_all archives sections' do
    sign_in @teacher

    post :archive_all

    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 5, response_json['num_hidden']
    @teacher.sections_owned.each do |section|
      assert_equal true, section.hidden
    end
  end

  test 'archive_all does archive cotaught section' do
    sign_in @teacher
    section_owner = create(:teacher)

    coteacher_section = create(:section, user: section_owner, login_type: 'picture')
    create(:section_instructor, section: coteacher_section, instructor: @teacher, status: :active)

    post :archive_all

    assert_response :success

    coteacher_section.reload
    assert_equal true, coteacher_section.hidden

    response_json = JSON.parse(@response.body)
    assert_equal 6, response_json['num_hidden']
    @teacher.sections_owned.each do |section|
      assert_equal true, section.hidden
    end
  end

  test 'retrieve_lessons_for_dropdown returns lessons links for a unit' do
    sign_in @teacher
    get :retrieve_lessons_for_dropdown, params: {id: @flappy_section.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal response_json, [{"text"=>"Flappy Code", "value"=>"/courses/flappy/units/1"}, {"text"=>"Flappy Code", "value"=>"/courses/flappy/units/1/lessons/1/levels/1"}]
  end

  describe '#retrieve_lessons_for_dropdown' do
    let(:teacher) {create(:teacher)}
    let(:unit_group) {create(:unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
    let(:unit) {create(:unit, :with_levels)}
    let(:unit_position) {1}
    let!(:unit_group_unit) {create(:unit_group_unit, unit_group: unit_group, script: unit, position: unit_position)}
    let(:lesson) {unit.lessons.first}
    let(:section) {create(:section, user: teacher, script: unit, unit_group: unit_group, login_type: 'email')}
    let(:response) {JSON.parse(@response.body, symbolize_names: true)}
    let(:response_unit) {response.first}
    let(:response_lesson) {response.second}

    before do
      sign_in teacher
      lesson.update!(has_lesson_plan: true)
      get :retrieve_lessons_for_dropdown, params: {id: section.id}
    end

    it 'returns success' do
      assert_response :success
    end

    it 'returns Array' do
      _(response).must_be_instance_of Array
    end

    it 'returns unit name' do
      _(response_unit[:text]).must_equal unit.title_for_display(unit_group_unit: unit_group_unit)
    end

    it 'returns unit path' do
      _(response_unit[:value]).must_equal "/courses/#{unit_group.name}/units/#{unit_position}"
    end

    it 'returns lesson name' do
      _(response_lesson[:text]).must_equal lesson.localized_title
    end

    it 'returns lesson path' do
      _(response_lesson[:value]).must_equal "/courses/#{unit_group.name}/units/#{unit_position}/lessons/1/levels/1"
    end
  end
end
