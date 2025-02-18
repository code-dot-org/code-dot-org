class ProgrammingMethodsController < ApplicationController
  load_and_authorize_resource

  def edit
    @overload_options = @programming_method.programming_class.programming_methods.select {|m| m.overload_of.blank? && m.id != @programming_method.id}.map {|m| {key: m.key, name: m.name}}
  end

  def update
    return render :not_found unless @programming_method
    @programming_method.assign_attributes(programming_method_params)
    if @programming_method.save
      @programming_method.programming_class.write_serialization
      render json: @programming_method.summarize_for_edit
    else
      render(status: :not_acceptable, plain: @programming_method.errors.full_messages)
    end
  end

  private def programming_method_params
    transformed_params = params.transform_keys(&:underscore)
    transformed_params = transformed_params.permit(
      :name,
      :external_documentation,
      :content,
      :syntax,
      :tips,
      :overload_of,
      examples: [:name, :description, :code, :app, :image, :app_display_type, :embed_app_with_code_height],
      parameters: [:name, :type, :required, :description]
    )
    transformed_params[:examples] = transformed_params[:examples].to_json if transformed_params[:examples]
    transformed_params[:parameters] = transformed_params[:parameters].to_json if transformed_params[:parameters]
    transformed_params[:overload_of] = nil if transformed_params[:overload_of] && transformed_params[:overload_of].empty?
    transformed_params
  end
end
