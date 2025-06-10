class Policies::Courses
  MODULARITY_PILOT = 'modularity'

  # Checks if the modularity feature is enabled for a user.
  #
  # @param user [Object] the user for whom the modularity feature check is performed.
  #   Defaults to the current user stored in `RequestStore`.
  # @return [Boolean] true if the modularity feature is enabled for the
  def self.modularity_enabled?
    DCDO.get(MODULARITY_PILOT, true)
  end
end
