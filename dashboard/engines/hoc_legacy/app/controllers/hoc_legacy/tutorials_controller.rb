# frozen_string_literal: true

require 'cdo/db'
require 'cdo/tutorials'

module HocLegacy
  class TutorialsController < ApplicationController
    before_action :assign_tutorial_by_short_code, only: %i[show]
    before_action :assign_tutorial_by_code, only: %i[begin begin_pixel finish finish_pixel]
    before_action :require_tutorial, only: %i[show begin begin_pixel finish finish_pixel]

    after_action :disable_caching, only: %i[begin begin_pixel finish_current finish finish_pixel]

    # GET /hour/:short_code
    def show
      TutorialLauncher.call(controller: self, tutorial: @tutorial, company: params[:company]) if db_write_enabled?
      redirect_to @tutorial[:url], status: :found
    end

    # GET /api/hour/begin/:code
    def begin
      if db_write_enabled?
        # set company to nil if not a valid company
        company = params[:company].presence || request.cookies['company']
        # Pass through the company param to the congrats page only if an entry exists in the forms.
        company = nil if company.present? && !PEGASUS_DB[:forms].where(kind: 'CompanyProfile', name: company).first

        TutorialLauncher.call(controller: self, tutorial: @tutorial, company: company)
      end

      redirect_to @tutorial[:url], status: :found
    end

    # GET /api/hour/begin_:code.png
    def begin_pixel
      TutorialPixelLauncher.call(controller: self, tutorial: @tutorial, company: params[:company]) if db_write_enabled?
      send_pixel_png
    end

    # GET /api/hour/finish
    def finish_current
      session_row = db_write_enabled? ? TutorialCompleter.call(controller: self) : nil
      redirect_to_congrats_page(session_row:)
    end

    # GET /api/hour/finish/:code
    def finish
      session_row = db_write_enabled? ? TutorialCompleter.call(controller: self, tutorial: @tutorial) : nil
      redirect_to_congrats_page(session_row:)
    end

    # GET /api/hour/finish_:code.png
    def finish_pixel
      TutorialPixelCompleter.call(controller: self, tutorial: @tutorial) if db_write_enabled?
      send_pixel_png
    end

    # POST /api/hour/certificate
    # POST /v2/certificate
    def certificate
      session_params = params.permit(:session_s, :name_s)
      session_row = PEGASUS_DB[:hoc_activity].where(session: session_params[:session_s]).first || {}

      person_name = session_params[:name_s]&.strip&.presence
      if person_name && session_row[:id] && session_row[:name].blank?
        PEGASUS_DB[:hoc_activity].where(id: session_row[:id]).update(name: person_name) if db_write_enabled?
        session_row[:name] = person_name
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

    private def db_write_enabled?
      DCDO.get('hoc_apis_in_dashboard', false)
    end

    private def assign_tutorial_by_short_code
      short_code = params[:short_code]
      short_code = 'mchoc' if short_code == 'MC'
      @tutorial = Tutorials.new(:tutorials).find_with_short_code(short_code)
    rescue Sequel::DatabaseError
      @tutorial = nil
    end

    private def assign_tutorial_by_code
      @tutorial = Tutorials.new(:tutorials).find_with_code(params[:code]) ||
        Tutorials.new(:tutorials_more).find_with_code(params[:code])
    end

    private def require_tutorial
      head :not_found unless @tutorial
    end

    private def disable_caching
      response.headers['Cache-Control'] = 'private, must-revalidate, max-age=0'
    end

    private def send_pixel_png
      send_file Rails.root.join('app/assets/images/1x1.png'), disposition: 'inline'
    end

    private def redirect_to_congrats_page(session_row:)
      congrats_url_params = {}

      congrats_url_params[:i]  = session_row[:session] if session_row.try(:[], :session).present?
      congrats_url_params[:co] = session_row[:company] if session_row.try(:[], :company).present?
      congrats_url_params[:s]  = Base64.urlsafe_encode64(@tutorial[:code]) if @tutorial.try(:[], :code).present?

      redirect_to main_app.congrats_url(congrats_url_params), status: :found
    end
  end
end
