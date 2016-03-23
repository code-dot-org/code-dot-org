class Plc::EnrollmentTaskAssignmentsController < ApplicationController
  load_and_authorize_resource

  # GET /plc/enrollment_task_assignments
  # GET /plc/enrollment_task_assignments.json
  def index
  end

  # GET /plc/enrollment_task_assignments/1
  # GET /plc/enrollment_task_assignments/1.json
  def show
  end

  # PATCH/PUT /plc/enrollment_task_assignments/1
  # PATCH/PUT /plc/enrollment_task_assignments/1.json
  def update
    if @enrollment_task_assignment.update(plc_enrollment_task_assignment_params)
      redirect_to action: show, notice: 'Task assignment was successfully updated'
    else
      redirect_to action: edit
    end
  end

  # DELETE /plc/enrollment_task_assignments/1
  # DELETE /plc/enrollment_task_assignments/1.json
  def destroy
    @enrollment_task_assignment.destroy
    redirect_to action: :index
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_enrollment_task_assignment_params
    if params[:plc_written_enrollment_task_assignment]
      params.require(:plc_written_enrollment_task_assignment).permit(:submission)
    else
      params[:plc_enrollment_task_assignment]
    end
  end
end
