class FrontendStudioController < ApplicationController
  def index
    # The feature flag turns the app on, and off again, without a deploy.
    return head :not_found unless DCDO.get('frontend_studio_enabled', !Rails.env.production?)

    # Only files carry an extension, never a client route. HTML here would let
    # the CDN cache a page under a .js address.
    return head :not_found if params[:path].present? && File.extname(params[:path]).present?

    render 'frontend_studio/index', layout: false
  end
end
