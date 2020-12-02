class ExperimentsController < ApplicationController
  before_action :authenticate_user!

  # Experiments are get requests so that a user can click on a link to join or leave an experiment

  # GET /experiments/set_course_experiment/:experiment_name
  def set_course_experiment
    unless current_user.teacher?
      redirect_to '/', flash: {alert: "Only teachers may join course experiments."}
      return
    end

    unless UnitGroupUnit.find_by(experiment_name: params[:experiment_name])
      redirect_to '/', flash: {alert: "Unknown experiment name '#{params[:experiment_name]}'."}
      return
    end

    SingleUserExperiment.find_or_create_by!(
      min_user_id: current_user.id,
      name: params[:experiment_name]
    )
    redirect_to '/', flash: {notice: "You have successfully joined the experiment '#{params[:experiment_name]}'."}
  end

  VALID_EXPERIMENTS = ['2018-teacher-experience'] + Experiment::PILOT_EXPERIMENTS.collect {|p| p[:name] if p[:allow_joining_via_url]}.compact

  # GET /experiments/set_single_user_experiment/:experiment_name
  def set_single_user_experiment
    experiment_name = params[:experiment_name]

    unless VALID_EXPERIMENTS.include?(experiment_name)
      redirect_to '/', flash: {alert: "'#{params[:experiment_name]}' is not a valid experiment."}
      return
    end

    if Experiment.enabled?(experiment_name: experiment_name, user: current_user)
      redirect_to '/', flash: {alert: "Already enabled in experiment '#{params[:experiment_name]}'."}
      return
    end

    SingleUserExperiment.find_or_create_by!(
      min_user_id: current_user.id,
      name: experiment_name
    )
    redirect_to '/', flash: {notice: "You have successfully joined the experiment '#{params[:experiment_name]}'."}
  end

  # GET /experiments/disable_single_user_experiment/:experiment_name
  def disable_single_user_experiment
    experiment_name = params[:experiment_name]

    unless VALID_EXPERIMENTS.include?(experiment_name)
      redirect_to '/', flash: {alert: "'#{params[:experiment_name]}' is not a valid experiment."}
      return
    end

    unless Experiment.enabled?(experiment_name: experiment_name, user: current_user)
      redirect_to '/', flash: {alert: "Unable to leave experiment '#{params[:experiment_name]}'."}
      return
    end

    SingleUserExperiment.where(min_user_id: current_user.id, name: experiment_name).destroy_all
    redirect_to '/', flash: {notice: "You have successfully disabled the experiment '#{params[:experiment_name]}'."}
  end
end
