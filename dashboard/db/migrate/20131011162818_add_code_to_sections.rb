class AddCodeToSections < ActiveRecord::Migration[4.2]
  def change
    add_column :sections, :code, :string

    Section.all.each {|s| s.assign_code; s.save!}

    add_index :sections, :code, unique: true
  end
end
