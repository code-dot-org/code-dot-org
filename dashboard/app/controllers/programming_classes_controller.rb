class ProgrammingClassesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
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
    return render :not_found unless @programming_class
    @environment_categories = @programming_class.programming_environment.categories.map {|c| {key: c.key, name: c.name}}
  end

  def update
    unless @programming_class
      render :not_found
      return
    end
    @programming_class.assign_attributes(programming_class_params.except(:category_key))
    programming_environment_category = @programming_class.programming_environment.categories.find_by_key(programming_class_params[:category_key])
    @programming_class.programming_environment_category_id = programming_environment_category&.id
    begin
      @programming_class.save! if @programming_class.changed?
      @programming_class.write_serialization
      render json: @programming_class.summarize_for_edit.to_json
    rescue ActiveRecord::RecordInvalid => e
      render(status: :not_acceptable, plain: e.message)
    end
  end

  private

  def programming_class_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :name,
      :category_key,
      :external_documentation,
      :content,
      :syntax,
      :tips,
      examples: [:name, :description, :code, :app, :image, :app_display_type, :embed_app_with_code_height],
      fields: [:name, :type, :description]
    )
    transformed_params[:examples] = transformed_params[:examples].to_json if transformed_params[:examples]
    transformed_params[:fields] = transformed_params[:fields].to_json if transformed_params[:fields]
    transformed_params
  end
end
