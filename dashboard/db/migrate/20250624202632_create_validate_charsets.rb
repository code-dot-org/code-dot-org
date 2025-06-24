class CreateValidateCharsets < ActiveRecord::Migration[6.1]
  def change
    create_table :validate_charsets do |t|
      t.timestamps
      t.boolean :flag
    end
  end
end
