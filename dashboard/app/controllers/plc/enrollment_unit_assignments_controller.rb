class Plc::EnrollmentUnitAssignmentsController < ApplicationController
  load_and_authorize_resource

  # GET /plc/enrollment_unit_assignments
  # GET /plc/enrollment_unit_assignments.json
  def index
  end

  # GET /plc/enrollment_unit_assignments/1
  # GET /plc/enrollment_unit_assignments/1.json
  def show
  end

  # GET /plc/enrollment_unit_assignments/new
  def new
  end

  # POST /plc/enrollment_unit_assignments
  # POST /plc/enrollment_unit_assignments.json
  def create
    @enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.new(plc_enrollment_unit_assignment_params)

    if @enrollment_unit_assignment.save
      redirect_to @enrollment_unit_assignment, notice: 'Course unit was successfully created'
    else
      redirect_to action: :new
    end
  end

  # DELETE /plc/enrollment_unit_assignments/1
  # DELETE /plc/enrollment_unit_assignments/1.json
  def destroy
    @plc_enrollment_unit_assignment.destroy

    redirect_to plc_enrollment_unit_assignments_url
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_enrollment_unit_assignment_params
    params.require(:plc_enrollment_unit_assignment).permit(:plc_user_course_enrollment_id, :plc_course_unit_id, :status)
  end
end
