class SharedBlocklyFunctionsController < ApplicationController
  load_and_authorize_resource

  def new
    render 'edit'
  end
end
