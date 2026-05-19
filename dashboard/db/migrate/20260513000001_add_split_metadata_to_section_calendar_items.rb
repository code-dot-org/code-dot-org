class AddSplitMetadataToSectionCalendarItems < ActiveRecord::Migration[7.0]
  def change
    add_column :section_calendar_items, :split_group_id, :string
    add_column :section_calendar_items, :split_part_index, :integer
    add_column :section_calendar_items, :split_part_count, :integer
  end
end
