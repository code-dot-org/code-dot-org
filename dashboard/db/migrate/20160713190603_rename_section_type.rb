class RenameSectionType < ActiveRecord::Migration
  # Columns named 'type' are reserved for single table inheritance (STI).
  # This is for a string representing the type of section, but not STI,
  # so renaming to section_type.
  # Otherwise setting it to anything will cause ActiveRecord::SubclassNotFound errors
  def change
    rename_column :sections, :type, :section_type
  end
end
