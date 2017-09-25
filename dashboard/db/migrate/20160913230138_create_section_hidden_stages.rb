class CreateSectionHiddenStages < ActiveRecord::Migration[5.0]
  def change
    create_table :section_hidden_stages do |section_hidden_stages|
      section_hidden_stages.belongs_to :section, null: false
      section_hidden_stages.belongs_to :stage, null: false
    end
  end
end
