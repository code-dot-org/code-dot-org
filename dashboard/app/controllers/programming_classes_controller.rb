class ProgrammingClassesController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :require_levelbuilder_mode_or_test_env
  before_action :require_levelbuilder_mode_or_test_env, only: [:new, :create, :edit, :update, :destroy, :get_filtered_results]
  load_and_authorize_resource

  def new
    @programming_environments_for_select = ProgrammingEnvironment.all.map {|env| {id: env.id, name: env.name}}
  end

  def create
    unless ProgrammingEnvironment.find_by_id(params[:programming_environment_id])
      render :not_acceptable, json: {error: 'Valid programming environment is required'}
      return
    end
    programming_class = ProgrammingClass.new(key: params[:key], name: params[:key], programming_environment_id: params[:programming_environment_id])
    if programming_class.save
      programming_class.write_serialization
      redirect_to edit_programming_class_url(programming_class)
    else
      render :not_acceptable, json: programming_class.errors
    end
  end

  def edit
    @programming_class = ProgrammingClass.find_by_id(params[:id])
    return render :not_found unless @programming_class
    @environment_categories = @programming_class.programming_environment.categories.map {|c| {key: c.key, name: c.name}}
  end

  # GET /programming_classes/get_filtered_results
  # Possible filters:
  # - programmingEnvironmentId
  # - categoryId
  # - page (1 indexed)
  def get_filtered_results
    return render(status: :not_acceptable, json: {error: 'Page is required'}) unless params[:page]

    @programming_classes = ProgrammingClass.all
    @programming_classes = @programming_classes.where(programming_environment_id: params[:programmingEnvironmentId]) if params[:programmingEnvironmentId]
    @programming_classes = @programming_classes.where(programming_environment_category_id: params[:categoryId]) if params[:categoryId]

    results_per_page = 20
    total_classes = @programming_classes.length
    num_pages = (total_classes / results_per_page.to_f).ceil

    @programming_classes = @programming_classes.page(params[:page]).per(results_per_page)
    render json: {numPages: num_pages, results: @programming_classes.map(&:summarize_for_all_code_docs)}
  end

  def update
    unless @programming_class
      render :not_found
      return
    end
    @programming_class.assign_attributes(programming_class_params.except(:category_key, :methods))
    programming_environment_category = @programming_class.programming_environment.categories.find_by_key(programming_class_params[:category_key])
    @programming_class.programming_environment_category_id = programming_environment_category&.id
    if programming_class_params[:methods]
      @programming_class.programming_methods = programming_class_params[:methods].each_with_index.map do |method_params, i|
        if method_params['id']
          method = ProgrammingMethod.find(method_params['id'])
          method.update!(method_params.merge(position: i))
          method
        else
          ProgrammingMethod.create!(method_params.merge(programming_class_id: @programming_class.id, position: i))
        end
      end
    end
    begin
      @programming_class.save! if @programming_class.changed?
      @programming_class.write_serialization
      render json: @programming_class.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => exception
      render(status: :not_acceptable, plain: exception.message)
    end
  end

  def show
    return render :not_found unless @programming_class
    @programming_environment_categories = @programming_class.programming_environment.categories_for_navigation
  end

  # GET /docs/ide/<programming_environment_name>/classes/<programming_class_key>
  def show_by_keys
    set_class_by_keys
    return render :not_found unless @programming_class
    return head :forbidden unless can?(:read, @programming_class)
    @programming_environment_categories = @programming_class.programming_environment.categories_for_navigation
    return render :show
  end

  def destroy
    return render :not_found unless @programming_class
    begin
      @programming_class.destroy
      render(status: :ok, plain: "Destroyed #{@programming_class.name}")
    rescue
      render(status: :not_acceptable, plain: @programming_class.errors.full_messages.join('. '))
    end
  end

  private def programming_class_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :name,
      :category_key,
      :external_documentation,
      :content,
      :syntax,
      :tips,
      examples: [:name, :description, :code, :app, :image, :app_display_type, :embed_app_with_code_height],
      fields: [:name, :type, :description],
      methods: [:id, :name]
    )
    transformed_params[:examples] = transformed_params[:examples].to_json if transformed_params[:examples]
    transformed_params[:fields] = transformed_params[:fields].to_json if transformed_params[:fields]
    transformed_params
  end

  private def set_class_by_keys
    @programming_class = ProgrammingClass.get_from_cache(params[:programming_environment_name], params[:programming_class_key])
  end
end
