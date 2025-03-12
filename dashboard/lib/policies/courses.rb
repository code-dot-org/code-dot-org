class Policies::Courses
  MODULARITY_PILOT = 'modularity'

  def self.modularity_enabled?(user)
    # Pilot settings for individual users takes precedence
    user_enabled = Experiment.enabled?(user: user, experiment_name: MODULARITY_PILOT)
    return user_enabled if user_enabled
    DCDO.get(MODULARITY_PILOT, false)
  end
end
