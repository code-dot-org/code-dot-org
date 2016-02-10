class PlcEvaluationQuestionsController < ApplicationController
  before_action :set_plc_evaluation_question, only: [:show, :edit, :update, :destroy]

  # GET /plc_evaluation_questions
  # GET /plc_evaluation_questions.json
  def index
    @plc_evaluation_questions = PlcEvaluationQuestion.all
  end

  # GET /plc_evaluation_questions/1
  # GET /plc_evaluation_questions/1.json
  def show
  end

  # GET /plc_evaluation_questions/new
  def new
    @plc_evaluation_question = PlcEvaluationQuestion.new
  end

  # GET /plc_evaluation_questions/1/edit
  def edit
  end

  # POST /plc_evaluation_questions
  # POST /plc_evaluation_questions.json
  def create
    puts plc_evaluation_question_params.inspect

    better_params = {professional_learning_course_id: plc_evaluation_question_params[:professional_learning_course_id], question: plc_evaluation_question_params[:question]}
    puts better_params
    @plc_evaluation_question = PlcEvaluationQuestion.new(better_params)

    respond_to do |format|
      if @plc_evaluation_question.save
        format.html { redirect_to @plc_evaluation_question, notice: 'Plc evaluation question was successfully created.' }
        format.json { render action: 'show', status: :created, location: @plc_evaluation_question }
      else
        format.html { render action: 'new' }
        format.json { render json: @plc_evaluation_question.errors, status: :unprocessable_entity }
      end
    end

    answers = plc_evaluation_question_params[:answers].split(',')
    answers.each do |answer|
      PlcEvaluationAnswer.new(answer: answer.chomp!, plc_evaluation_question: @plc_evaluation_question).save
    end
  end

  # PATCH/PUT /plc_evaluation_questions/1
  # PATCH/PUT /plc_evaluation_questions/1.json
  def update
    respond_to do |format|
      if @plc_evaluation_question.update(plc_evaluation_question_params)
        format.html { redirect_to @plc_evaluation_question, notice: 'Plc evaluation question was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @plc_evaluation_question.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /plc_evaluation_questions/1
  # DELETE /plc_evaluation_questions/1.json
  def destroy
    @plc_evaluation_question.destroy
    respond_to do |format|
      format.html { redirect_to plc_evaluation_questions_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
  def set_plc_evaluation_question
    @plc_evaluation_question = PlcEvaluationQuestion.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_evaluation_question_params
    params.required(:plc_evaluation_question).permit(:professional_learning_course_id, :question, :answers)
  end
end
