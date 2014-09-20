class AddCodeToSections < ActiveRecord::Migration
  def change
    add_column :sections, :code, :string

    Section.all.each { |s| s.assign_code; s.save! }

    add_index :sections, :code, unique: true
  end
end
