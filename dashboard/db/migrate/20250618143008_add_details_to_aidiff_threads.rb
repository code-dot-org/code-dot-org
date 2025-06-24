class AddDetailsToAidiffThreads < ActiveRecord::Migration[6.1]
  def change
    rename_column :aidiff_threads, :level_id, :lesson_id
    add_column :aidiff_threads, :metadata_config, :json
    add_column :aidiff_threads, :system_prompt, :text
    add_column :aidiff_threads, :session_created, :datetime
    add_column :aidiff_threads, :course_id, :integer
    add_column :aidiff_threads, :level_id, :integer
    add_column :aidiff_threads, :context_type, :string
  end
end
