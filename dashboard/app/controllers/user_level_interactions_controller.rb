require 'json'

class UserLevelInteractionsController < ApplicationController
  include LevelsHelper
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :user_level_interaction

  # POST /user_level_interactions
  def create
    unit_id = user_level_interaction_params[:script_id]
    begin
      unit = Unit.find(unit_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Unit with id #{unit_id}"
    end

    level_id = user_level_interaction_params[:level_id]
    begin
      level = Level.find(level_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Level with id #{level_id}"
    end

    project_data = get_project_and_version_id(level_id, unit_id)
    channel = get_channel_for(level, unit_id, current_user)
    user_level_interaction_params[:code_version] = project_data[:version_id]

    version_year = unit.get_course_version.key

    metadata = {
      course_offering: unit.properties["curriculum_umbrella"],
      version_year: version_year,
      unit: unit.name,
      level_type: level.type,
      user_type: current_user.user_type,
      project_id: project_data[:project_id],
      channel: channel,
    }

    new_uli_params = user_level_interaction_params.merge(
      code_version: project_data[:version_id],
      metadata: metadata.to_json,
    )

    if should_create_uli?(version_year)
      @user_level_interaction = UserLevelInteraction.new(new_uli_params)
      if @user_level_interaction.save
        render(status: :created, json: {message: "Successfully created UserLevelInteraction.", id: @user_level_interaction.id})
      else
        render(status: :not_acceptable, json: {error: 'There was an error creating a new UserLevelInteraction.'})
      end
    else
      render(status: :bad_request, json: {message: 'UserLevelInteraction not created because this level is not in a 2024+ unit.'})
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
      :metadata,
    )
    user_level_interaction_params[:user_id] = current_user.id
    user_level_interaction_params[:school_year] = school_year

    user_level_interaction_params
  end
end
