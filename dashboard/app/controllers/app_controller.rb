class AppController < ApplicationController
  def index
    # Only render the app in development mode while the frontend is being built.
    return head :not_found unless Rails.env.development?

    render 'app/index', layout: false
  end
end
