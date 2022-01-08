# Find all the sections that are assigned to a script that has a participant audience
# other than students and update the participant type of those sections to match
# the participant audience of the script they are assigned to
class UpdateParticipantTypeOnSections < ActiveRecord::Migration[5.2]
  def change
    unit_ids = Script.where(participant_audience: 'teacher').map(&:id)
    Section.where(script_id: unit_ids).update_all(participant_type: 'teacher')

    unit_ids = Script.where(participant_audience: 'facilitator').map(&:id)
    Section.where(script_id: unit_ids).update_all(participant_type: 'facilitator')
  end
end
