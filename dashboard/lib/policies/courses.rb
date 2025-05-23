class Policies::Courses
  MODULARITY_PILOT = 'modularity'

  # Checks if the modularity feature is enabled for a user.
  #
  # @return [Boolean] true if the modularity feature is enabled for the
  def self.modularity_enabled?
    DCDO.get(MODULARITY_PILOT, false)
  end
end
