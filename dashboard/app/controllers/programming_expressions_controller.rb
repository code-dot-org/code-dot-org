class ProgrammingExpressionsController < ApplicationController
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
      redirect_to '/home/'
    else
      render :not_acceptable, json: programming_expression.errors
    end
  end

  def edit
    @programming_expression = ProgrammingExpression.find_by_id(params[:id])
    return render :not_found unless @programming_expression
  end

  def update
    underscored_params = params.transform_keys(&:underscore).permit(:id, :name, :short_description, :video_key)
    programming_expression = ProgrammingExpression.find_by_id(underscored_params[:id])
    unless programming_expression
      render :not_found
      return
    end
    programming_expression.name = underscored_params[:name]
    programming_expression.short_description = underscored_params[:short_description]
    programming_expression.video_key = underscored_params[:video_key] unless underscored_params[:video_key].blank?
    programming_expression.save! if programming_expression.changed?
  end
end
