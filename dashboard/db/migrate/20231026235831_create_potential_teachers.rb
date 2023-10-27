class CreatePotentialTeachers < ActiveRecord::Migration[6.1]
  def change
    create_table :potential_teachers do |t|
      t.string :name
      t.string :email
      t.string :tutorial_source

      t.timestamps
    end
  end
end
