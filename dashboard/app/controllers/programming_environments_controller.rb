class ProgrammingEnvironmentsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env

  def edit
    @programming_environment = ProgrammingEnvironment.find_by_name(params[:name])
    return render :not_found unless @programming_environment
  end

  def update
    programming_environment = ProgrammingEnvironment.find_by_name(params[:name])
    unless programming_environment
      render :not_found
      return
    end
    programming_environment.assign_attributes(programming_environment_params)
    begin
      if programming_environment.changed?
        programming_environment.save!
        programming_environment.write_serialization
      end
      render json: programming_environment.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => e
      render(status: :not_acceptable, plain: e.message)
    end
  end

  private

  def programming_environment_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :title,
      :description,
      :editor_type,
      :image_url
    )
    transformed_params
  end
end
