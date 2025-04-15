class Policies::Courses
  MODULARITY_PILOT = 'modularity'

  # Checks if the modularity feature is enabled for a user.
  #
  # @param user [Object] the user for whom the modularity feature check is performed.
  #   Defaults to the current user stored in `RequestStore`.
  # @return [Boolean] true if the modularity feature is enabled for the
  def self.modularity_enabled?(user = RequestStore.store[:current_user])
    # Pilot settings for individual users takes precedence
    if user
      user_enabled = Experiment.enabled?(user: user, experiment_name: MODULARITY_PILOT)
      return user_enabled if user_enabled
    end
    DCDO.get(MODULARITY_PILOT, false)
  end
end
