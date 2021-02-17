class IdelabController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource class: :idelab

  # GET /idelab
  def index
  end
end
