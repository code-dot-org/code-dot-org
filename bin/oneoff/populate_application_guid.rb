#!/usr/bin/env ruby

# This script populates the application_guid for all Pd::Applications that do
# not yet have one. It exists because the auto-populatioon of application_guid
# originally existed only on teacher applications, and was recently moved to
# apply to all application types.

require_relative '../../dashboard/config/environment'

Pd::Application::ApplicationBase.
  where(application_guid: nil).
  each(&:generate_application_guid).
  each(&:save!)
