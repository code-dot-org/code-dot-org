class AppController < ApplicationController
  def index
    # Only render the app in preprod while the frontend is being built.
    return head :not_found if Rails.env.production?

    render 'app/index', layout: false
  end
end
