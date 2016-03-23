require 'test_helper'

class Plc::CoursesControllerTest < ActionController::TestCase
  setup do
    @course = create(:plc_course)
    @user = create :admin
    sign_in(@user)
    @module1 = create(:plc_learning_module, name: 'Module 1')
    @module2 = create(:plc_learning_module, name: 'Module 2')
    @question = create(:plc_evaluation_question, plc_course: @course, question: 'Some question')
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create plc_course" do
    2.times do
      @controller = Plc::CoursesController.new
      course_name = SecureRandom.hex
      assert_difference('Plc::Course.count') do
        post :create, plc_course: { plc_course: @course, name: course_name }
      end
      assert_equal course_name, Plc::Course.find_by(name: course_name).name
      assert_redirected_to plc_course_path(assigns(:course))
    end
  end

  test "should create evaluation questions" do
    post :submit_new_questions_and_answers, id: @course, newQuestionsList: ['question 1', 'question 2'].to_s, newAnswersList: [].to_s
    assert_redirected_to plc_course_path(assigns(:course))

    assert_equal 2, Plc::EvaluationQuestion.where(question: ['question 1', 'question 2']).count
  end

  test "should create evaluation answers" do
    post :submit_new_questions_and_answers, id: @course, newQuestionsList: [].to_s,
         newAnswersList: "{\"#{@question.id}\":[\
                     {\"answer\": \"Answer 1\", \"learningModuleId\": \"#{@module1.id}\"},\
                     {\"answer\": \"Answer 2\", \"learningModuleId\": \"#{@module2.id}\"}\
                  ]}"

    assert_redirected_to plc_course_path(assigns(:course))

    assert_equal 2, Plc::EvaluationAnswer.where(plc_evaluation_question: @question).count
    assert_equal 1, Plc::EvaluationAnswer.where(plc_learning_module_id: @module1.id).count
    assert_equal 1, Plc::EvaluationAnswer.where(plc_learning_module_id: @module2.id).count
  end

  test "should show plc_course" do
    get :show, id: @course
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @course
    assert_response :success
  end

  test "should update plc_course" do
    patch :update, id: @course, plc_course: { plc_course: @course }
    assert_redirected_to plc_course_path(assigns(:course))
  end

  test "should destroy plc_course" do
    assert_difference('Plc::Course.count', -1) do
      delete :destroy, id: @course
    end

    assert_redirected_to plc_content_creator_show_courses_and_modules_path
  end
end
