class ProgrammingExpressionsController < ApplicationController
  include Rails.application.routes.url_helpers
  include ProxyHelper
  EXPIRY_TIME = 30.minutes

  before_action :require_levelbuilder_mode_or_test_env, except: [:search, :show, :show_by_keys]
  before_action :set_expression_by_keys, only: [:show_by_keys, :docs_show]
  load_and_authorize_resource

  # GET /programming_expressions/get_filtered_expressions
  # Possible filters:
  # - programmingEnvironmentId
  # - categoryId
  # - page (1 indexed)
  def get_filtered_expressions
    return render(status: :not_acceptable, json: {error: 'Page is required'}) unless params[:page]

    @programming_expressions = ProgrammingExpression.all
    @programming_expressions = @programming_expressions.where(programming_environment_id: params[:programmingEnvironmentId]) if params[:programmingEnvironmentId]
    @programming_expressions = @programming_expressions.where(programming_environment_category_id: params[:categoryId]) if params[:categoryId]

    results_per_page = 20
    total_expressions = @programming_expressions.length
    num_pages = (total_expressions / results_per_page.to_f).ceil

    @programming_expressions = @programming_expressions.page(params[:page]).per(results_per_page)
    render json: {numPages: num_pages, expressions: @programming_expressions.map(&:summarize_for_all_code_docs)}
  end

  # GET /programming_expressions/search
  def search
    programming_environment =
      if params.key? :programmingEnvironmentId
        ProgrammingEnvironment.find(params[:programmingEnvironmentId])
      elsif params.key? :programmingEnvironmentName
        ProgrammingEnvironment.find_by(name: params[:programmingEnvironmentName])
      end
    render json: ProgrammingExpressionAutocomplete.get_search_matches(params[:page], params[:query], programming_environment)
  end

  def new
    @programming_environments_for_select = ProgrammingEnvironment.all.map {|env| {id: env.id, name: env.name}}
  end

  def create
    unless ProgrammingEnvironment.find_by_id(params[:programming_environment_id])
      render :not_acceptable, json: {error: 'Valid programming environment is required'}
      return
    end
    programming_expression = ProgrammingExpression.new(key: params[:key], name: params[:key], programming_environment_id: params[:programming_environment_id])
    if programming_expression.save
      programming_expression.write_serialization
      redirect_to edit_programming_expression_url(programming_expression)
    else
      render :not_acceptable, json: programming_expression.errors
    end
  end

  def edit
    @programming_expression = ProgrammingExpression.find_by_id(params[:id])
    return render :not_found unless @programming_expression
    @environment_categories = @programming_expression.programming_environment.categories.map {|c| {key: c.key, name: c.name}}
  end

  def update
    programming_expression = ProgrammingExpression.find_by_id(params[:id])
    unless programming_expression
      render :not_found
      return
    end
    programming_expression.assign_attributes(programming_expression_params.except(:category_key, :parameters))
    programming_expression.palette_params = programming_expression_params[:parameters]
    programming_environment_category = programming_expression.programming_environment.categories.find_by_key(programming_expression_params[:category_key])
    programming_expression.programming_environment_category_id = programming_environment_category&.id
    # TODO: get rid of this when we remove the category column
    programming_expression.category = programming_environment_category&.name || programming_expression_params[:category_key]
    begin
      programming_expression.save! if programming_expression.changed?
      programming_expression.write_serialization
      render json: programming_expression.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => e
      render(status: :not_acceptable, plain: e.message)
    end
  end

  def show
    if params[:id]
      @programming_expression = ProgrammingExpression.find(params[:id])
      return render :not_found unless @programming_expression
      return head :forbidden unless can?(:read, @programming_expression)
      @programming_environment_categories = @programming_expression.programming_environment.categories.select {|c| c.programming_expressions.count > 0}.map(&:summarize_for_environment_show)
    else
      render :not_found
    end
  end

  def show_by_keys
    return render :not_found unless @programming_expression
    if params[:programming_environment_name] && params[:programming_expression_key]
      @programming_environment_categories = @programming_expression.programming_environment.categories.select {|c| c.programming_expressions.count > 0}.map(&:summarize_for_environment_show)
      return render :show
    end
    render :not_found
  end

  def destroy
    return render :not_found unless @programming_expression
    begin
      @programming_expression.destroy
      render(status: 200, plain: "Destroyed #{@programming_expression.name}")
    rescue
      render(status: :not_acceptable, plain: @programming_expression.errors.full_messages.join('. '))
    end
  end

  # POST /programming_expressions/:id/clone
  def clone
    return render :not_found unless @programming_expression
    return render(status: not_acceptable, plain: 'Must provide destination programming environment') unless params[:destinationProgrammingEnvironmentName]
    begin
      new_exp = @programming_expression.clone_to_programming_environment(params[:destinationProgrammingEnvironmentName], params[:destinationCategoryKey])
      render(status: 200, json: {editUrl: edit_programming_expression_path(new_exp)})
    rescue => err
      render(json: {error: err.message}.to_json, status: :not_acceptable)
    end
  end

  def docs_show
    if DCDO.get('use-studio-code-docs', false)
      return render :not_found unless @programming_expression
      @programming_environment_categories = @programming_expression.programming_environment.categories.select {|c| c.programming_expressions.count > 0}.map(&:summarize_for_environment_show)
      return render :show
    end
    render_proxied_url(
      "https://curriculum.code.org/docs/#{params[:programming_environment_name]}/#{params[:programming_expression_key]}/",
      allowed_content_types: nil,
      allowed_hostname_suffixes: %w(curriculum.code.org),
      expiry_time: EXPIRY_TIME,
      infer_content_type: true
    )
  end

  private

  def programming_expression_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :name,
      :block_name,
      :category_key,
      :video_key,
      :image_url,
      :short_description,
      :external_documentation,
      :content,
      :syntax,
      :return_value,
      :tips,
      parameters: [:name, :type, :required, :description],
      examples: [:name, :description, :code, :app, :image, :app_display_type, :embed_app_with_code_height]
    )
    transformed_params
  end

  def set_expression_by_keys
    @programming_expression = ProgrammingEnvironment.find_by_name(params[:programming_environment_name])&.programming_expressions&.find_by_key(params[:programming_expression_key])
  end
end
