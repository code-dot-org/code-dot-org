class ProgrammingEnvironmentsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env

  def edit
    @programming_environment = ProgrammingEnvironment.find_by_name(params[:name])
    return render :not_found unless @programming_environment
  end
end
