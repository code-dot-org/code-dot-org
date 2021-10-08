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
      redirect_to edit_programming_expression_url(programming_expression)
    else
      render :not_acceptable, json: programming_expression.errors
    end
  end

  def edit
    @programming_expression = ProgrammingExpression.find_by_id(params[:id])
    return render :not_found unless @programming_expression
    @environment_categories = @programming_expression.programming_environment.categories
  end

  def update
    programming_expression = ProgrammingExpression.find_by_id(params[:id])
    unless programming_expression
      render :not_found
      return
    end
    programming_expression.assign_attributes(programming_expression_params)
    begin
      programming_expression.save! if programming_expression.changed?
      render json: programming_expression.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => e
      render(status: :not_acceptable, plain: e.message)
    end
  end

  def show
    @programming_expression = ProgrammingExpression.find(params[:id])
  end

  private

  def programming_expression_params
    transformed_params = params.transform_keys(&:underscore)
    puts transformed_params.keys.inspect
    transformed_params = transformed_params.permit(
      :name,
      :category,
      :short_description,
      :external_documentation,
      :content,
      :syntax,
      :return_value,
      :tips,
      :parameters
    )
    puts transformed_params.keys.inspect
    transformed_params[:parameters] = JSON.parse(transformed_params[:parameters]) if transformed_params[:parameters]
    puts transformed_params.inspect
    transformed_params
  end
end
