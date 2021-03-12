class AddPropertiesToVocabulary < ActiveRecord::Migration[5.2]
  def change
    add_column :vocabularies, :properties, :text
  end
end
