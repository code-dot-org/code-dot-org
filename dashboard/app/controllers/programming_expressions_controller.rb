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
    puts @programming_environments_for_select.inspect
  end

  def create
    puts params[:key]
    puts params[:programming_environment_id]
    ProgrammingExpression.create!(key: params[:key], name: params[:key], programming_environment_id: params[:programming_environment_id])
  end
end
