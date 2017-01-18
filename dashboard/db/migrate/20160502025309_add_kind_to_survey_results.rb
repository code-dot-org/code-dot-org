class AddKindToSurveyResults < ActiveRecord::Migration[4.2]
  def change
    # The `kind` column will be used to store the kind of survey, e.g.,
    # DiversityYYYY, NetPromoterScoreYYYY, etc.
    add_column :survey_results, :kind, :string, after: :user_id
    add_index :survey_results, :kind

    reversible do |direction|
      direction.up do
        # On 2016-04-30, existing rows are the diversity survey from March 2016.
        SurveyResult.update_all(kind: 'Diversity2016')
      end
    end
  end
end
