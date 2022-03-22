class ProgrammingEnvironmentsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show]
  before_action :set_programming_environment, except: [:index, :new, :create]
  authorize_resource

  def index
    @programming_environments = ProgrammingEnvironment.where(published: true).order(:name).map(&:summarize_for_index)
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
          programming_environment_params[:categories].each_with_index.map do |category, i|
            if category['id'].blank?
              ProgrammingEnvironmentCategory.create!(category.merge(programming_environment_id: programming_environment.id, position: i))
            else
              existing_category = programming_environment.categories.find(category['id'])
              existing_category.assign_attributes(category.except('id'))
              existing_category.position = i
              existing_category.save! if existing_category.changed?
              existing_category
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
    return render :not_found unless @programming_environment
    return head :forbidden unless can?(:read, @programming_environment)
    @programming_environment_categories = @programming_environment.categories.select {|c| c.programming_expressions.count > 0}.map(&:summarize_for_environment_show)
  end

  def destroy
    return render :not_found unless @programming_environment
    begin
      @programming_environment.destroy!
      render(status: 200, plain: "Destroyed #{@programming_environment.name}")
    rescue => e
      render(status: :not_acceptable, plain: e.message)
    end
  end

  private

  def programming_environment_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :title,
      :published,
      :description,
      :editor_type,
      :block_pool_name,
      :image_url,
      :project_url,
      categories: [:id, :name, :color]
    )
    transformed_params
  end

  def set_programming_environment
    @programming_environment = ProgrammingEnvironment.find_by_name(params[:name])
  end
end
