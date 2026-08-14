class FrontendStudioController < ApplicationController
  def index
    # Off in production until we turn it on, and a kill switch afterwards.
    return head :not_found unless DCDO.get('frontend_studio_enabled', !Rails.env.production?)

    # Asset URLs only come from the Vite manifest, so a miss under assets/ is a
    # bad URL, never a client route. Answering with HTML would let the CDN cache
    # a page under a .js address.
    return head :not_found if params[:path]&.start_with?('assets/')

    render 'frontend_studio/index', layout: false
  end
end
