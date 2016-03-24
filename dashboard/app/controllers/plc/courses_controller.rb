class Plc::CoursesController < ApplicationController
  load_and_authorize_resource

  # GET /plc/courses/1
  # GET /plc/courses/1.json
  def show
  end

  # GET /plc/courses/new
  def new
  end

  # GET /plc/courses/1/edit
  def edit
  end

  # POST /plc/courses
  # POST /plc/courses.json
  def create
    if @course.save
      redirect_to @course, notice: 'Course was successfully created.'
    else
      redirect_to action: :new
    end
  end

  # PATCH/PUT /plc/courses/1
  # PATCH/PUT /plc/courses/1.json
  def update
    if @course.update(course_params)
      redirect_to @course, notice: 'Course was successfully updated.'
    else
      render action: :edit
    end
  end

  def submit_new_questions_and_answers
    JSON.parse(new_questions_params).each do |question|
      Plc::EvaluationQuestion.create(plc_course: @course, question: question)
    end

    JSON.parse(new_answers_params).each do |question_id, answer_list|
      answer_list.each do |answer_properties|
        Plc::EvaluationAnswer.create(plc_evaluation_question_id: question_id, answer: answer_properties['answer'], plc_learning_module_id: answer_properties['learningModuleId'] == '' ? nil : answer_properties['learningModuleId'])
      end
    end
    redirect_to @course
  end

  # DELETE /plc/courses/1
  # DELETE /plc/courses/1.json
  def destroy
    @course.destroy
    redirect_to plc_content_creator_show_courses_and_modules_path
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def course_params
    params.require(:plc_course).permit(:name)
  end

  def new_questions_params
    params.require(:newQuestionsList)
  end

  def new_answers_params
    params.require(:newAnswersList)
  end
end
