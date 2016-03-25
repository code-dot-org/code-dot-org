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
    @plc_enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.new(plc_enrollment_unit_assignment_params)

    respond_to do |format|
      if @plc_enrollment_unit_assignment.save
        format.html { redirect_to @plc_enrollment_unit_assignment, notice: 'Enrollment unit assignment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @plc_enrollment_unit_assignment }
      else
        format.html { render action: 'new' }
        format.json { render json: @plc_enrollment_unit_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /plc/enrollment_unit_assignments/1
  # DELETE /plc/enrollment_unit_assignments/1.json
  def destroy
    @plc_enrollment_unit_assignment.destroy
    respond_to do |format|
      format.html { redirect_to plc_enrollment_unit_assignments_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_enrollment_unit_assignment
    @plc_enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_enrollment_unit_assignment_params
    params.require(:plc_enrollment_unit_assignment).permit(:plc_user_course_enrollment_id, :plc_course_unit_id, :status)
  end
end
