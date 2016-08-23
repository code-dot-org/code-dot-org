class FrequentUnsuccessfulLevelSourcesController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource
  check_authorization

  def index
  end
end
