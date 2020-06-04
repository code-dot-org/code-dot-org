class AddForeignKeyForScriptToSection < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :sections, :scripts
  end
end
