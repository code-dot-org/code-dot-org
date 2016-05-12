class RemoveSurvey2015ValueSurvey2015CommentFromUsers  < ActiveRecord::Migration
  def change
    reversible do |direction|
      # The up direction clears the survey2015_value and survey2015_comment
      # fields from the users table if they exist.
      direction.up do
        User.with_deleted.where("properties LIKE '%survey2015%'").find_each do |user|
          user.survey2015_value = nil
          user.survey2015_comment = nil
          user.save!
        end
      end

      # The down direction repopulates the survey2015_value and
      # survey2015_comment fields in the users table from the survey_results
      # table.
      direction.down do
        SurveyResult.where(kind: 'NetPromoterScore2015').find_each do |survey_result|
          user = User.with_deleted.where(id: survey_result.user_id).first
          if user
            user.survey2015_value = survey_result.nps_value
            user.survey2015_comment = survey_result.nps_comment
            user.save!
          end
        end
      end
    end
  end
end
