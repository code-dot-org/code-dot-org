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

  # TODO: deprecate this page which is no longer active since the Maker app was deprecated.
  # For now, since this update https://github.com/code-dot-org/code-dot-org/pull/64729,
  # maker scripts no longer are accessible via "family_name" of "devices".
  # Temporarily show 'devices-2024' script.
  def self.maker_script(for_user)
    Unit.find_by(name: 'devices-2024')
  end

  def setup
  end
end
