class CreateSectionHiddenScripts < ActiveRecord::Migration[5.0]
  def change
    create_table :section_hidden_scripts do |section_hidden_scripts|
      section_hidden_scripts.belongs_to :section, null: false
      section_hidden_scripts.belongs_to :script, null: false
    end
  end
end
