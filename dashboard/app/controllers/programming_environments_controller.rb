class ProgrammingEnvironmentsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:index]

  def index
    @programming_environments = ProgrammingEnvironment.all.order(:name).map(&:summarize_for_index)
  end

  def new
  end

  def create
    programming_environment = ProgrammingEnvironment.create(name: params[:name])
    if programming_environment.save
      programming_environment.write_serialization
      redirect_to edit_programming_environment_url(programming_environment.name)
    else
      render(status: :not_acceptable, json: programming_environment.errors)
    end
  end

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
    programming_environment.assign_attributes(programming_environment_params.except(:categories))
    begin
      if programming_environment_params[:categories]
        programming_environment.categories =
          programming_environment_params[:categories].map do |category|
            if category['id']
              existing_category = programming_environment.categories.find(category['id'])
              existing_category.assign_attributes(category.except('id'))
              existing_category.save! if existing_category.changed?
              existing_category
            else
              ProgrammingEnvironmentCategory.create!(category.merge(programming_environment_id: programming_environment.id))
            end
          end
      end
      programming_environment.save! if programming_environment.changed?
      programming_environment.write_serialization
      render json: programming_environment.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => e
      render(status: :not_acceptable, plain: e.message)
    end
  end

  def show
    @programming_environment = ProgrammingEnvironment.find_by_name(params[:name])
    return render :not_found unless @programming_environment
    @programming_environment_categories = @programming_environment.categories.select {|c| c.programming_expressions.count > 0}.map(&:summarize_for_environment_show)
  end

  private

  def programming_environment_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :title,
      :description,
      :editor_type,
      :image_url,
      :project_url,
      categories: [:id, :name, :color]
    )
    transformed_params
  end
end
