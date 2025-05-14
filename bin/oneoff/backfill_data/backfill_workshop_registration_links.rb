#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

# Script to backfill the registration_link field in workshops that can show up on the Regional Workshop page (i.e.
# meet the following criteria):
# - Have a registration_link of `nil` (we don't want to overwrite any existing links)
# - Not started
# - Not hidden
# - For CSD, CSP, and CSA workshops, they must be 5-day summer workshops
# - For other workshops, have a participant_group_type of 'National' or 'Regional'
# We will be setting future workshop registration_link fields upon creation (either to a custom link or defaulting
# to our site), so this script will backfill the rest of the workshops in preparation for the launch of the
# Regional Workshop page.

DRY_RUN = !(ARGV.find {|arg| arg.casecmp('-dryrun')}).nil?

AYW_COURSES = [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP, Pd::Workshop::COURSE_CSA]
VALID_PARTICIPANT_GROUP_TYPES = ["National", "Regional"]

ActiveRecord::Base.transaction do
  total_updated = 0
  total_errors = 0

  Pd::Workshop.where(started_at: nil, registration_link: nil).and(Pd::Workshop.where(hidden: false).or(Pd::Workshop.where(hidden: nil))).each do |ws|
    if AYW_COURSES.include?(ws.course)
      if ws.subject == Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
        begin
          ws.update!(registration_link: regional_partner&.link_to_partner_application.presence || "/pd/application/teacher")
          total_updated += 1
        rescue exception
          puts "Error updating workshop #{ws.id}: #{exception.message}"
          total_errors += 1
        end
      end
    else
      if VALID_PARTICIPANT_GROUP_TYPES.include?(ws.participant_group_type)
        begin
          ws.update!(registration_link: registration_link.presence || "/pd/workshops/#{id}/enroll")
          total_updated += 1
        rescue exception
          puts "Error updating workshop #{ws.id}: #{exception.message}"
          total_errors += 1
        end
      end
    end
  end

  # Raise an error so that the db transaction rolls back for dry runs.
  raise "This was a dry run. No rows were modified or added. Set dry_run: false to modify db" if DRY_RUN
ensure
  future_tense_dry_run = DRY_RUN ? ' to be' : ''
  summary_message = "Finished backfilling workshop registration_link fields:\n" \
    "#{total_updated} workshops#{future_tense_dry_run} updated.\n" \
    "#{total_errors} workshops#{future_tense_dry_run} with errors.\n"

  CDO.log.info summary_message
end
