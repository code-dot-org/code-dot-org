# A migration that transfers the net promoter score survey results in the users
# table to the survey_results table. Does NOT remove the data from the users
# table.

require 'active_record'

class MigrateNetPromoterScore2015Data < ActiveRecord::Migration
  def change
    reversible do |direction|
      # In the up direction, we create SurveyResult records for users having
      # a survey2015_value or survey2015_comment. For safety, we do not remove
      # the information from the users row in this migration.
      direction.up do
        ActiveRecord::Base.record_timestamps = false
        begin
          User.all.each do |user|
            if user.survey2015_value or user.survey2015_comment
              SurveyResult.create(
                user_id: user.id,
                kind: 'NetPromoterScore2015',
                properties: {
                  nps_value: user.survey2015_value,
                  nps_comment: user.survey2015_comment
                },
                # The NPS survey was administered 4 June 2015 to 15 Sept 2015.
                created_at: '2015-09-15 00:00:00 UTC',
                updated_at: '2015-09-15 00:00:00 UTC')
            end
          end
        ensure
          ActiveRecord::Base.record_timestamps = true
        end
      end

      # In the down direction, we simply eliminate all SurveyResult's of kind
      # NetPromoterScore2015.
      direction.down do
        SurveyResult.where(kind: 'NetPromoterScore2015').delete_all
      end
    end
  end
end
