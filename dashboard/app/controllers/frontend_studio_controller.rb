class FrontendStudioController < ApplicationController
  def index
    # Only render the app in preprod while the frontend is being built.
    return head :not_found if Rails.env.production?

    render 'frontend_studio/index', layout: false
  end
end
