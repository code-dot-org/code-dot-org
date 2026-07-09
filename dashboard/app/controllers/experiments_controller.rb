class ExperimentsController < ApplicationController
  before_action :authenticate_user!

  # The set/disable actions are GETs so that joining or leaving an experiment
  # can be a clickable link in an email; see the warnings on each.

  # Returns whether the given experiment can be joined (or left) via url.
  # Currently, joining by URL is enabled for pilots where allow_joining_via_url is true
  def can_join_via_url?(experiment_name)
    return true if Pilot.find_by(name: experiment_name).try(:allow_joining_via_url)
    return false
  end

  # GET /experiments
  # Lists the experiments the current user individually opted into.
  # Percentage- and section-based experiments are excluded: the user did not
  # choose those, so there is nothing for them to manage here. Browser-local
  # experiments live in local storage and are rendered by the page's JS.
  def index
    enrolled = SingleUserExperiment.active.where(min_user_id: current_user.id)
    pilots_by_name = Pilot.where(name: enrolled.map(&:name)).index_by(&:name)
    @user_experiments = enrolled.map do |experiment|
      pilot = pilots_by_name[experiment.name]
      {
        name: experiment.name,
        displayName: pilot&.display_name,
        endAt: experiment.end_at,
        canLeave: !!pilot&.allow_joining_via_url,
      }
    end
  end

  # POST /experiments/leave/:experiment_name
  # Removes the current user from an experiment they joined. Used by the
  # /experiments page.
  def leave
    experiment_name = params[:experiment_name]
    return head :forbidden unless can_join_via_url?(experiment_name)

    destroyed = SingleUserExperiment.where(min_user_id: current_user.id, name: experiment_name).destroy_all
    destroyed.empty? ? head(:not_found) : head(:no_content)
  end

  # GET /experiments/set_single_user_experiment/:experiment_name
  # WARNING: state-mutating GET, kept only so joining an experiment can be a
  # clickable link in an email. It redirects and never reports failure to the
  # caller; do not use it outside those links.
  def set_single_user_experiment
    experiment_name = params[:experiment_name]

    unless can_join_via_url?(experiment_name)
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
  # WARNING: state-mutating GET, kept only so leaving an experiment can be a
  # clickable link in an email. It redirects and never reports failure to the
  # caller; do not use it outside those links — use the POST leave action.
  def disable_single_user_experiment
    experiment_name = params[:experiment_name]

    unless can_join_via_url?(experiment_name)
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
