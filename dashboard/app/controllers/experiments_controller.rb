class ExperimentsController < ApplicationController
  before_action :authenticate_user!

  # Experiments are get requests so that a user can click on a link to join or leave an experiment

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

  # GET /experiments/set_single_user_experiment/:experiment_name
  def set_single_user_experiment
    valid_experiments = ['2018-teacher-experience']
    experiment_name = params[:experiment_name]

    unless valid_experiments.include?(experiment_name)
      redirect_to '/', flash: {alert: "'#{params[:experiment_name]}' is not a valid experiment."}
      return
    end

    # Default to being active for 30 days
    now = DateTime.now
    SingleUserExperiment.find_or_create_by!(
      min_user_id: current_user.id,
      name: experiment_name,
      end_at: now + 30.days
    )
    redirect_to '/', flash: {notice: "You have successfully joined the experiment '#{params[:experiment_name]}'."}
  end

  # GET /experiments/disable_single_user_experiment/:experiment_name
  def disable_single_user_experiment
    experiment_name = params[:experiment_name]

    unless Experiment.enabled?(experiment_name: experiment_name, user: current_user)
      redirect_to '/', flash: {alert: "You are not in the '#{params[:experiment_name]}' experiment."}
      return
    end

    experiment = SingleUserExperiment.where(min_user_id: current_user.id, name: experiment_name).first
    experiment.destroy
    redirect_to '/', flash: {notice: "You have successfully disabled the experiment '#{params[:experiment_name]}'."}
  end
end
