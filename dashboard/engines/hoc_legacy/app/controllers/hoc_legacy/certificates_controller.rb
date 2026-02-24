# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  class CertificatesController < ApplicationController
    before_action :assign_session_row, only: %i[show update]

    # GET /api/hour/certificates/:session_id
    def show
      return render_404 if @session_row.blank?

      certificate_params = {
        name: @session_row[:name].to_s.strip,
        course: @session_row[:tutorial],
      }

      redirect_to certificate_path(Base64.urlsafe_encode64(certificate_params.to_json))
    end

    # PATCH /api/hour/certificates/:session_id
    def update
      session_params = params.permit(:name)
      session_row = @session_row || {}

      if session_row[:id] && session_row[:name].blank?
        session_row[:name] = session_params[:name]&.strip&.presence
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

    private def assign_session_row
      @session_row = PEGASUS_DB[:hoc_activity].where(session: params[:session_id]).first
    end
  end
end
