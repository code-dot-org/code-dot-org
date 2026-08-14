class FrontendStudioController < ApplicationController
  def index
    # Off in production until we turn it on, and a kill switch afterwards.
    return head :not_found unless DCDO.get('frontend_studio_enabled', !Rails.env.production?)

    # A path with a file extension asks for a file from the package, never a
    # client route: hashed bundles under assets/, and the files Vite copies to
    # the root, like favicon.svg. Answering a miss with HTML would let the CDN
    # cache a page under a .js or .svg address.
    return head :not_found if params[:path].present? && File.extname(params[:path]).present?

    render 'frontend_studio/index', layout: false
  end
end
