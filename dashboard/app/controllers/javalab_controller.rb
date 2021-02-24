class JavalabController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource class: :javalab

  # GET /javalab
  def index
  end
end
