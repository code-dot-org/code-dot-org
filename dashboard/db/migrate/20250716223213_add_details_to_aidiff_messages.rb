class AddDetailsToAidiffMessages < ActiveRecord::Migration[6.1]
  def change
    add_column :aidiff_messages, :preset_chip_text, :text
    add_column :aidiff_messages, :raw_content, :text
    add_column :aidiff_messages, :source_links, :json
  end
end
