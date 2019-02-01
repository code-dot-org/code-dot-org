#!/usr/bin/env ruby

require_relative('../../dashboard/config/environment')

ACTIVE_PLC_COURSES = [30, 34] # Course IDs that we need to backfill peer reviews for

peer_reviewable = ScriptLevel.where(
  script: Plc::Course.find(ACTIVE_PLC_COURSES).flat_map(&:plc_course_units).flat_map(&:script)
).flat_map(&:levels).select {|x| x.try(:peer_reviewable?)}

peer_reviewable_submissions = UserLevel.where(
  user: Plc::UserCourseEnrollment.where(plc_course_id: ACTIVE_PLC_COURSES).map(&:user),
  level: peer_reviewable,
  submitted: true
)

backfilled_users_map = Hash.new(0)
backfilled_levels_map = Hash.new(0)

peer_reviewable_submissions.each do |ul|
  next unless PeerReview.where(submitter_id: ul.user.id, level_source_id: ul.level_source_id).size < 2

  backfilled_users_map[ul.user_id] += 1
  backfilled_levels_map[ul.level_id] += 1

  PeerReview.create_for_submission(ul, ul.level_source_id)
end

if backfilled_users_map.any?
  backfilled_users = <<-MESSAGE
Backfilled peer reviews for these users
```
#{JSON.pretty_generate backfilled_users_map}

```
  MESSAGE

  backfilled_levels = <<-MESSAGE
Backfilled peer reviews for these levels
```
#{JSON.pretty_generate backfilled_levels_map}
````
  MESSAGE

  ChatClient.message("plc-engineering", backfilled_users)
  ChatClient.message("plc-engineering", backfilled_levels)
  ChatClient.message("plc-engineering", "Backfilling peer reviews for #{backfilled_users_map.values.reduce(:+)} total")
else
  ChatClient.message("plc-engineering", "No peer reviews need to be backfilled")
end
