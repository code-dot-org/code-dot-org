class ExperimentsController < ApplicationController
  before_action :authenticate_user!

  # GET /experiments/set_course_experiment/:experiment_name
  def set_course_experiment
    unless current_user.teacher?
      redirect_to '/', flash: {alert: "Only teachers may join course experiments."}
      return
    end

    unless CourseScript.find_by(experiment_name: params[:experiment_name])
      redirect_to '/', flash: {alert: "Unknown experiment name '#{params[:experiment_name]}'."}
      return
    end

    SingleUserExperiment.find_or_create_by!(
      min_user_id: current_user.id,
      name: params[:experiment_name]
    )
    redirect_to '/', flash: {notice: "You have successfully joined the experiment '#{params[:experiment_name]}'."}
  end
end
