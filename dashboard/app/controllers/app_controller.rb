class AppController < ApplicationController
  def index
    render 'app/index', layout: false
  end
end
