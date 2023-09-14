# A migration that transfers the net promoter score survey results in the users
# table from soft-deleted rows to the survey_results table. Does NOT remove the
# data from the users table.

class MigrateDeletedUsersNetPromoterScore2015Data < ActiveRecord::Migration[4.2]
  def change
    reversible do |direction|
      # In the up direction, we create SurveyResult records for soft-deleted
      # users (non-deleted users were handled in a previous migration) having a
      # survey2015_value or survey2015_comment. For safety, we do not remove the
      # information from the users row in this migration.
      direction.up do
        ActiveRecord::Base.record_timestamps = false
        begin
          User.only_deleted.where("properties LIKE '%survey2015%'").
            find_each do |user|
            if user.survey2015_value || user.survey2015_comment
              # Skip the user if we already transferred their response before
              # the account was deleted.
              existing_survey_result = SurveyResult.
                where(user_id: user.id, kind: 'NetPromoterScore2015').
                any?
              if existing_survey_result
                next
              end

              SurveyResult.create!(
                user_id: user.id,
                kind: 'NetPromoterScore2015',
                properties: {
                  nps_value: user.survey2015_value,
                  nps_comment: user.survey2015_comment
                },
                # The NPS survey was administered 4 June 2015 to 15 Sept 2015.
                created_at: '2015-09-15 00:00:00 UTC',
                updated_at: '2015-09-15 00:00:00 UTC'
              )
            end
          end
        ensure
          ActiveRecord::Base.record_timestamps = true
        end
      end

      # In the down direction, for simplicity, we eliminate all SurveyResult's
      # of kind NetPromoterScore2015 from all (deleted or otherwise) users.
      direction.down do
        SurveyResult.where(kind: 'NetPromoterScore2015').delete_all
      end
    end
  end
end
