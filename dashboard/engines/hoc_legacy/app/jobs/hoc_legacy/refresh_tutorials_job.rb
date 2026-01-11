# frozen_string_literal: true

module HocLegacy
  class RefreshTutorialsJob < ApplicationJob
    rescue_from StandardError, with: :report_exception

    def perform
      Tutorials.refresh if CDO.hoc_tracking_enabled
    end
  end
end
