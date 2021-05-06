class AddSimpleSurveyFormIdToSubmission < ActiveRecord::Migration[5.2]
  def change
    add_column :foorm_simple_survey_submissions, :simple_survey_form_id, :bigint,
      after: :user_id
    Foorm::SimpleSurveySubmission.reset_column_information

    reversible do |dir|
      dir.up do
        ActiveRecord::Base.transaction do
          Foorm::SimpleSurveySubmission.find_each(batch_size: 1000) do |submission|
            simple_survey_form = Foorm::SimpleSurveyForm.find_by(path: submission.misc_form_path)
            next if simple_survey_form.nil?

            submission.update!(simple_survey_form_id: simple_survey_form.id)
          end
        end
      end
    end
  end
end
