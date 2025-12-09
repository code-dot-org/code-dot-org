# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  class TutorialsController < ApplicationController
    before_action :assign_tutorial, only: %i[begin begin_pixel finish finish_pixel], if: -> {CDO.hoc_tracking_enabled}
    before_action :require_tutorial, only: %i[begin begin_pixel finish finish_pixel], if: -> {CDO.hoc_tracking_enabled}

    after_action :disable_caching

    # GET /api/hour/begin/:code
    def begin
      tutorial_url = @tutorial&.primary_link_ref&.fields.try(:[], :primary_target)
      return render_404 if tutorial_url.blank?

      TutorialLauncher.call(controller: self, tutorial: @tutorial) if CDO.hoc_tracking_enabled

      # If the tutorial_url is a relative path, make it absolute by prepending code.org
      tutorial_url = CDO.code_org_url(tutorial_url, CDO.default_scheme) if tutorial_url.starts_with?('/')

      redirect_to tutorial_url, status: :found
    end

    # GET /api/hour/begin_:code.png
    def begin_pixel
      TutorialPixelLauncher.call(controller: self, tutorial: @tutorial) if CDO.hoc_tracking_enabled
      send_pixel_png
    end

    # GET /api/hour/finish
    def finish_current
      session_row = TutorialCompleter.call(controller: self) if CDO.hoc_tracking_enabled
      redirect_to_course_completion_certificate_url(session_row:)
    end

    # GET /api/hour/finish/:code
    def finish
      session_row = TutorialCompleter.call(controller: self, tutorial: @tutorial) if CDO.hoc_tracking_enabled
      redirect_to_course_completion_certificate_url(session_row:)
    end

    # GET /api/hour/finish_:code.png
    def finish_pixel
      TutorialPixelCompleter.call(controller: self, tutorial: @tutorial) if CDO.hoc_tracking_enabled
      send_pixel_png
    end

    private def assign_tutorial
      @tutorial = Tutorials.get(params[:code])
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

    private def redirect_to_course_completion_certificate_url(session_row:)
      redirect_to helpers.course_completion_certificate_url(
        session_id: session_row.try(:[], :session),
        course_name: @tutorial&.tutorial_id,
      )
    end
  end
end
