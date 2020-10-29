class AddWorkshopAgendaToPdFoormSubmissions < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshop_survey_foorm_submissions, :workshop_agenda, :string
  end
end
