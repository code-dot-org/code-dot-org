class MakerController < ApplicationController
  # Maker Toolkit is currently used in standalone Create Devices with Apps unit.
  # Retrieves the relevant Create Devices with Apps unit version based on self.maker_script.
  def home
    # Redirect to login if not signed in
    authenticate_user!

    maker_unit_for_user = MakerController.maker_script current_user
    current_level = current_user.next_unpassed_progression_level(maker_unit_for_user)
    @maker_unit = {
      assignableName: data_t_suffix('script.name', maker_unit_for_user[:name], 'title'),
      lessonName: current_level.lesson.localized_title,
      linkToOverview: script_path(maker_unit_for_user),
      linkToLesson: script_next_path(maker_unit_for_user, 'next')
    }
  end

  # Returns which devices script version to show:
  #   Assigned script should take precedence - show most recent version that's been assigned.
  #   Otherwise, show the most recent version with progress.
  #   If none of the above applies, default to most recent.
  def self.maker_script(for_user)
    Unit.latest_assigned_version('devices', for_user) ||
      Unit.latest_version_with_progress('devices', for_user) ||
      Unit.latest_stable_version('devices')
  end

  def setup
  end
end
