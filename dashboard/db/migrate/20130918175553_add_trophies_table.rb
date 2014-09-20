class AddTrophiesTable < ActiveRecord::Migration
  def change
    create_table :trophies do |t|
      t.string :name
      t.string :image_name

      t.timestamps
    end

    create_table :user_trophies do |t|
      t.references :user, null: false
      t.references :trophy, null: false
      t.references :concept, null: true

      t.timestamps
    end

    add_index :trophies, :name, unique: true
    add_index :user_trophies, [:user_id, :trophy_id, :concept_id], unique: true

    Activity.connection.execute('alter table activities modify data varchar(8192)')
  end
end
