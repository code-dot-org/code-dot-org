class FrontendStudioController < ApplicationController
  skip_before_action :initialize_statsig_stable_id

  CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=31536000, stale-if-error=31536000'

  def index
    # Only render the app in preprod while the frontend is being built.
    return head :not_found if Rails.env.production?

    response.headers['Cache-Control'] = CACHE_CONTROL
    render 'frontend_studio/index', layout: false
  end
end
