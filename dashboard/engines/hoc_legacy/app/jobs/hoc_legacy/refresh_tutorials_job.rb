# frozen_string_literal: true

module HocLegacy
  class RefreshTutorialsJob < ApplicationJob
    def perform
      Tutorials.refresh if CDO.hoc_tracking_enabled
    end
  end
end
