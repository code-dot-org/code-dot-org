require 'json'

class UserLevelInteractionsController < ApplicationController
  include LevelsHelper
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :user_level_interaction

  # POST /user_level_interactions
  def create
    version_year = JSON.parse(user_level_interaction_params[:metadata])["version_year"]
    if should_create_uli?(version_year)
      @user_level_interaction = UserLevelInteraction.new(user_level_interaction_params)
      if @user_level_interaction.save
        render(status: :created, json: {message: "Successfully created UserLevelInteraction.", id: @user_level_interaction.id})
      else
        render(status: :not_acceptable, json: {error: 'There was an error creating a new UserLevelInteraction.'})
      end
    else
      render(status: :bad_request, json: {message: 'UserLevelInteraction not created because this level is not in a 2024+ script.'})
    end
  end

  # The UserLevelInteractions table has the potential to grow very quickly.
  # Given that we are still experimenting with the best way to store and use this data,
  # we are going to cautiously limit the number of interactions we store to only
  # units from 2024 and beyond.
  def should_create_uli?(version_year)
    version_year.to_i >= 2024
  end

  def user_level_interaction_params
    user_level_interaction_params = params.transform_keys(&:underscore).permit(
      :level_id,
      :script_id,
      :school_year,
      :interaction,
      :code_version,
    )
    user_level_interaction_params[:user_id] = current_user.id
    user_level_interaction_params[:school_year] = school_year
    script_id = user_level_interaction_params[:script_id]
    unit = Unit.find(script_id)
    level = Level.find(user_level_interaction_params[:level_id])
    project_data = get_project_and_version_id(user_level_interaction_params[:level_id], user_level_interaction_params[:script_id])
    channel = get_channel_for(level, script_id, current_user)
    user_level_interaction_params[:code_version] = project_data[:version_id]
    metadata = {
      course_offering: unit.properties["curriculum_umbrella"],
      version_year: unit.get_course_version.key,
      unit: unit.name,
      level_type: level.type,
      user_type: current_user.user_type,
      project_id: project_data[:project_id],
      channel: channel,
    }.to_json
    user_level_interaction_params[:metadata] = metadata
    user_level_interaction_params
  end
end
