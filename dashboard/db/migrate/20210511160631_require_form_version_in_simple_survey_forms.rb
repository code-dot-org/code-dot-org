class RequireFormVersionInSimpleSurveyForms < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        Foorm::SimpleSurveyForm.
          where(form_version: nil).
          update_all(form_version: 0)
      end
    end

    change_column_null :foorm_simple_survey_forms, :form_version, false
  end
end
