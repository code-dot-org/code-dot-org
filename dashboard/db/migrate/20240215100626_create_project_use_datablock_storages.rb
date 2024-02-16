class CreateProjectUseDatablockStorages < ActiveRecord::Migration[6.0]
  def change
    create_table :project_use_datablock_storages do |t|
      t.references :project, null: false, foreign_key: true, type: :integer, index: true
      t.boolean :use_datablock_storage, default: false, null: false
    end
  end
end