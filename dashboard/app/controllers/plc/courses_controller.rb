class Plc::CoursesController < ApplicationController
  load_and_authorize_resource except: [:create]
  before_action :set_plc_course, only: [:show, :edit, :update, :destroy]

  # GET /plc/courses
  # GET /plc/courses.json
  def index
    @plc_courses = Plc::Course.all
  end

  # GET /plc/courses/1
  # GET /plc/courses/1.json
  def show
  end

  # GET /plc/courses/new
  def new
    @plc_course = Plc::Course.new
  end

  # GET /plc/courses/1/edit
  def edit
  end

  # POST /plc/courses
  # POST /plc/courses.json
  def create
    @plc_course = Plc::Course.new(plc_course_params)

    respond_to do |format|
      if @plc_course.save
        format.html { redirect_to @plc_course, notice: 'Course was successfully created.' }
      else
        format.html { render action: 'new' }
      end
    end
  end

  # PATCH/PUT /plc/courses/1
  # PATCH/PUT /plc/courses/1.json
  def update
    respond_to do |format|
      if @plc_course.update(plc_course_params)
        format.html { redirect_to @plc_course, notice: 'Course was successfully updated.' }
      else
        format.html { render action: 'edit' }
      end
    end
  end

  # DELETE /plc/courses/1
  # DELETE /plc/courses/1.json
  def destroy
    @plc_course.destroy
    redirect_to action: :index
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_course
    @plc_course = Plc::Course.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_course_params
    params.require(:plc_course).permit(:name)
  end
end
