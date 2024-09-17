# frozen_string_literal: true

require 'cdo/honeybadger'

module ActiveJobReporting
  extend ActiveSupport::Concern

  protected def report_exception(exception)
    Honeybadger.notify(
      exception,
      error_message: "[#{self.class}] Runtime error",
      context: {
        job: as_json,
      }
    )
  ensure
    raise exception
  end
end
