class Plc::CourseUnitsController < ApplicationController
  load_and_authorize_resource

  # GET /plc/course_units
  # GET /plc/course_units.json
  def index
  end

  # GET /plc/course_units/1
  # GET /plc/course_units/1.json
  def show
  end

  # GET /plc/course_units/new
  def new
    @course_unit.plc_course_id = params[:plc_course_id]
  end

  # GET /plc/course_units/1/edit
  def edit
  end

  # POST /plc/course_units
  # POST /plc/course_units.json
  def create
    if @course_unit.save
      redirect_to @course_unit, notice: 'Course unit was successfully created.'
    else
      redirect_to action: :new
    end
  end

  # PATCH/PUT /plc/course_units/1
  # PATCH/PUT /plc/course_units/1.json
  def update
    if @course_unit.update(course_unit_params)
      redirect_to @course_unit, notice: 'Course unit was successfully created.'
    else
      redirect_to action: :edit
    end
  end

  # DELETE /plc/course_units/1
  # DELETE /plc/course_units/1.json
  def destroy
    @course_unit.destroy
    redirect_to plc_content_creator_show_courses_and_modules_path
  end

  def submit_new_questions_and_answers
    JSON.parse(new_questions_params).each do |question|
      Plc::EvaluationQuestion.create(plc_course_unit: @course_unit, question: question)
    end

    JSON.parse(new_answers_params).each do |question_id, answer_list|
      answer_list.each do |answer_properties|
        Plc::EvaluationAnswer.create(plc_evaluation_question_id: question_id,
                                     answer: answer_properties['answer'],
                                     plc_learning_module_id: answer_properties['learningModuleId'] == '' ? nil : answer_properties['learningModuleId'])
      end
    end
    redirect_to @course_unit
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def course_unit_params
    params.require(:plc_course_unit).permit(:plc_course_id, :unit_name, :unit_description, :unit_order)
  end

  def new_questions_params
    params.require(:newQuestionsList)
  end

  def new_answers_params
    params.require(:newAnswersList)
  end
end
