class ProgrammingEnvironmentsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:index, :show, :docs_show, :docs_index, :get_summary_by_name]
  before_action :set_programming_environment, only: [:edit, :update, :destroy]
  authorize_resource

  def index
    @programming_environments = ProgrammingEnvironment.get_published_environments_from_cache
  end

  def docs_index
    @programming_environments = ProgrammingEnvironment.all.order(:name).map(&:summarize_for_index)
    render :index
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
  end

  def update
    @programming_environment.assign_attributes(programming_environment_params.except(:categories))
    begin
      if programming_environment_params[:categories]
        @programming_environment.categories =
          programming_environment_params[:categories].each_with_index.map do |category, i|
            if category['id'].blank?
              ProgrammingEnvironmentCategory.create!(category.merge(programming_environment_id: @programming_environment.id, position: i))
            else
              existing_category = @programming_environment.categories.find(category['id'])
              existing_category.assign_attributes(category.except('id'))
              existing_category.position = i
              existing_category.save! if existing_category.changed?
              existing_category
            end
          end
      end
      @programming_environment.save! if @programming_environment.changed?
      @programming_environment.write_serialization
      render json: @programming_environment.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => exception
      render(status: :not_acceptable, plain: exception.message)
    end
  end

  # GET /docs/ide/<name>
  def show
    @programming_environment = ProgrammingEnvironment.get_from_cache(params[:name])
    return render :not_found unless @programming_environment
    return head :forbidden unless can?(:read, @programming_environment)
    @programming_environment_categories = @programming_environment.categories_for_navigation
  end

  def docs_show
    @programming_environment = ProgrammingEnvironment.get_from_cache(params[:programming_environment_name])
    return render :not_found unless @programming_environment
    redirect_to(programming_environment_path(@programming_environment.name))
  end

  def destroy
    @programming_environment.destroy!
    render(status: :ok, plain: "Destroyed #{@programming_environment.name}")
  rescue => exception
    render(status: :not_acceptable, plain: exception.message)
  end

  def get_summary_by_name
    @programming_environment = ProgrammingEnvironment.get_from_cache(params[:name])
    return render :not_found unless @programming_environment
    return head :forbidden unless can?(:get_summary_by_name, @programming_environment)
    return render json: @programming_environment.categories_for_get
  end

  private def programming_environment_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :title,
      :published,
      :description,
      :editor_language,
      :block_pool_name,
      :image_url,
      :project_url,
      categories: [:id, :name, :color]
    )
    transformed_params
  end

  private def set_programming_environment
    @programming_environment = ProgrammingEnvironment.find_by_name(params[:name])
    raise ActiveRecord::RecordNotFound unless @programming_environment
  end
end
