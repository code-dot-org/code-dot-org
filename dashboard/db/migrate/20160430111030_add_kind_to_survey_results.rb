class AddKindToSurveyResults < ActiveRecord::Migration
  def change
    add_column :survey_results, :kind, :string, index: true, :after => :user_id

    reversible do |direction|
      direction.up do
        # On 2016-04-30, existing rows are the diversity survey from March 2016.
        SurveyResult.update_all(kind: 'Diversity2016')
      end
    end
  end
end
