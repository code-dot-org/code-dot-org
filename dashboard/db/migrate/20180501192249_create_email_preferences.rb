class CreateEmailPreferences < ActiveRecord::Migration[5.0]
  def change
    create_table :email_preferences do |t|
      t.string :email, null: false
      t.boolean :opt_in, null: false
      t.string :ip_address, null: false
      t.string :source, null: false
      t.string :form_kind

      t.timestamps
    end
    add_index :email_preferences, :email, unique: true, name: 'index_email_preferences_on_email'
  end
end
