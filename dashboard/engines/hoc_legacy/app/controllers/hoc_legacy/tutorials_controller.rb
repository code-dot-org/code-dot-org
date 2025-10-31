# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  class TutorialsController < ApplicationController
    CACHE_TTL = 1.hour.freeze

    before_action :assign_tutorial, only: %i[begin begin_pixel finish finish_pixel]
    before_action :require_tutorial, only: %i[show begin begin_pixel finish finish_pixel]

    after_action :disable_caching, only: %i[begin begin_pixel finish_current finish finish_pixel]

    # GET /api/hour/begin/:code
    def begin
      tutorial_url = @tutorial.primary_link_ref&.primary_target
      return render_404 if tutorial_url.blank?

      TutorialLauncher.call(controller: self, tutorial: @tutorial) if activity_tracking_enabled?

      # If the tutorial_url is a relative path, make it absolute by prepending code.org
      tutorial_url = CDO.code_org_url(tutorial_url, CDO.default_scheme) if tutorial_url.starts_with?('/')

      redirect_to tutorial_url, status: :found
    end

    # GET /api/hour/begin_:code.png
    def begin_pixel
      TutorialPixelLauncher.call(controller: self, tutorial: @tutorial) if activity_tracking_enabled?
      send_pixel_png
    end

    # GET /api/hour/finish
    def finish_current
      session_row = TutorialCompleter.call(controller: self) if activity_tracking_enabled?
      redirect_to_congrats_page(session_row:)
    end

    # GET /api/hour/finish/:code
    def finish
      session_row = TutorialCompleter.call(controller: self, tutorial: @tutorial) if activity_tracking_enabled?
      redirect_to_congrats_page(session_row:)
    end

    # GET /api/hour/finish_:code.png
    def finish_pixel
      TutorialPixelCompleter.call(controller: self, tutorial: @tutorial) if activity_tracking_enabled?
      send_pixel_png
    end

    # POST /api/hour/certificate
    # POST /v2/certificate
    def certificate
      session_params = params.permit(:session_s, :name_s)
      session_row = PEGASUS_DB[:hoc_activity].where(session: session_params[:session_s]).first || {}

      if session_row[:id] && session_row[:name].blank?
        session_row[:name] = session_params[:name_s]&.strip&.presence
        PEGASUS_DB[:hoc_activity].where(id: session_row[:id]).update(name: session_row[:name]) if session_row[:name]
      end

      render json: {
        session:          session_row[:session],
        tutorial:         session_row[:tutorial],
        company:          session_row[:company],
        started:          session_row[:started_at].present?,
        pixel_started:    session_row[:pixel_started_at].present?,
        pixel_finished:   session_row[:pixel_finished_at].present?,
        finished:         session_row[:finished_at].present?,
        name:             session_row[:name],
        certificate_sent: session_row[:name].present?,
      }
    end

    private def activity_tracking_enabled?
      DCDO.get('hoc_apis_in_dashboard', false)
    end

    private def assign_tutorial
      @tutorial = Rails.cache.fetch("hoc_legacy:tutorial:#{params[:code]}", expires_in: CACHE_TTL) do
        CdoContentful::CsForAll::Entry::Tutorial.find_by_code(params[:code])
      end
    end

    private def require_tutorial
      render_404 unless @tutorial
    end

    private def disable_caching
      response.headers['Cache-Control'] = 'private, must-revalidate, max-age=0'
    end

    private def send_pixel_png
      send_file Rails.root.join('app/assets/images/1x1.png'), disposition: 'inline'
    end

    private def redirect_to_congrats_page(session_row:)
      congrats_url_params = {}

      congrats_url_params[:i] = session_row[:session] if session_row.try(:[], :session).present?
      congrats_url_params[:s] = Base64.urlsafe_encode64(@tutorial.tutorial_id) if @tutorial

      redirect_to main_app.congrats_url(congrats_url_params), status: :found
    end
  end
end
