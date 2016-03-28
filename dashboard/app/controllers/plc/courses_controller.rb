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
end
