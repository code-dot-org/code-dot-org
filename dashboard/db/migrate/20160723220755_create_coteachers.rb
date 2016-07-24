class CreateCoteachers < ActiveRecord::Migration
  def change
    create_table :coteachers do |t|
      t.belongs_to :user, index: true
      t.belongs_to :section, index: true
      t.timestamps null: false
    end

    reversible do |dir|
      Section.all.each do |s|
        dir.up { s.users << User.find(s.user_id) }
        dir.down { s.user_id = s.users.first.id; s.save }
      end
    end

    remove_column :sections, :user_id, :integer
  end
end
