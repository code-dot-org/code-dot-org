class JavaIdeController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource class: :java_ide

  # GET /java_ide
  def index
  end
end
