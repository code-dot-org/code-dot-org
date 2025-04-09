class UserPreferencesController < ApplicationController
  before_action :authenticate_user!

  def update
    preference = UserPreference.find_or_initialize_by(user_id: current_user.id)
    preference.update!(section_order: update_params[:section_order])
  end

  private def update_params
    params.transform_keys(&:underscore).permit(
      section_order: []
    )
  end
end
