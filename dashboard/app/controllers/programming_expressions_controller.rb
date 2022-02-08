class ProgrammingExpressionsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:search]

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
    @environment_categories = @programming_expression.programming_environment.category_options
  end

  def update
    programming_expression = ProgrammingExpression.find_by_id(params[:id])
    unless programming_expression
      render :not_found
      return
    end
    programming_expression.assign_attributes(programming_expression_params.except(:parameters))
    programming_expression.palette_params = programming_expression_params[:parameters]
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
    else
      render :not_found
    end
  end

  def show_by_keys
    if params[:programming_environment_name] && params[:programming_expression_key]
      @programming_expression = ProgrammingEnvironment.find_by_name(params[:programming_environment_name])&.programming_expressions&.find_by_key(params[:programming_expression_key])
      return render :show if @programming_expression
    end
    render :not_found
  end

  private

  def programming_expression_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :name,
      :block_name,
      :category,
      :video_key,
      :image_url,
      :short_description,
      :external_documentation,
      :content,
      :syntax,
      :return_value,
      :tips,
      parameters: [:name, :type, :required, :description],
      examples: [:name, :description, :code, :app, :imageUrl, :appDisplayType, :appEmbedHeight]
    )
    transformed_params
  end
end
