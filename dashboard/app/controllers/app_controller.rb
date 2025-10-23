class AppController < ApplicationController
  def index
    return head :not_found if Rails.env.production?

    render 'app/index', layout: false
  end
end
