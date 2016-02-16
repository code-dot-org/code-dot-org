class ProfessionalLearningCoursesController < ApplicationController
  load_and_authorize_resource
  before_action :set_professional_learning_course, only: [:show, :edit, :update, :destroy]

  # GET /professional_learning_courses
  # GET /professional_learning_courses.json
  def index
    @professional_learning_courses = ProfessionalLearningCourse.all
  end

  # GET /professional_learning_courses/1
  # GET /professional_learning_courses/1.json
  def show
  end

  # GET /professional_learning_courses/new
  def new
    @professional_learning_course = ProfessionalLearningCourse.new
  end

  # GET /professional_learning_courses/1/edit
  def edit
  end

  # POST /professional_learning_courses
  # POST /professional_learning_courses.json
  def create
    @professional_learning_course = ProfessionalLearningCourse.new(professional_learning_course_params)

    respond_to do |format|
      if @professional_learning_course.save
        format.html { redirect_to @professional_learning_course, notice: 'Professional learning course was successfully created.' }
        format.json { render action: 'show', status: :created, location: @professional_learning_course }
      else
        format.html { render action: 'new' }
        format.json { render json: @professional_learning_course.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /professional_learning_courses/1
  # PATCH/PUT /professional_learning_courses/1.json
  def update
    respond_to do |format|
      if @professional_learning_course.update(professional_learning_course_params)
        format.html { redirect_to @professional_learning_course, notice: 'Professional learning course was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @professional_learning_course.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /professional_learning_courses/1
  # DELETE /professional_learning_courses/1.json
  def destroy
    @professional_learning_course.destroy
    respond_to do |format|
      format.html { redirect_to professional_learning_courses_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_professional_learning_course
    @professional_learning_course = ProfessionalLearningCourse.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def professional_learning_course_params
    params.require(:professional_learning_course).permit(:name)
  end
end
