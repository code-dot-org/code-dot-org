# frozen_string_literal: true

require 'cdo/geocoder'

# Records geolocation data for anonymous project storage records.
#
# Signed-in users are associated with geography through `dim_users` and `user_geos` tables,
# which uses the first IP captured during account creation.
# To mirror that behavior for signed-out users, this job records only the first IP seen for each `storage_id`.
class ProjectStorage::AnonymousGeoRecordingJob < ApplicationJob
  queue_as :default

  discard_on ActiveRecord::RecordNotUnique

  # Redis outages can affect many project creations at once.
  # Jittered delay to avoid retrying a large batch together.
  retry_on Redis::CannotConnectError, wait: ->(_) {30.minutes + rand(30.minutes)}, attempts: 2 do |job, error|
    job.report_exception(error)
  end

  # @param project_storage_id [Integer] the ID of the ProjectStorage record (user_project_storage_ids.id)
  # @param ip_address [String] the IP address used to look up geolocation data
  def perform(project_storage_id, ip_address)
    project_storage = ProjectStorage.find_by(id: project_storage_id)
    return if project_storage.nil? || project_storage.user_id.present?
    return if ProjectStorage::Geo.exists?(project_storage:)

    location = Geocoder.find(ip_address)

    project_storage.create_geo!(
      country: location&.country.presence,
      state:   location&.state.presence,
      city:    location&.city.presence,
    )
  end
end
