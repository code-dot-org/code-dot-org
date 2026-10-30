class AddJitPlTeachingTips < ActiveRecord::Migration[7.0]
  def change
    # A concept can contain many teaching tips for educators
    create_table :jit_pl_teaching_tips do |t|
      t.string :name
      t.text :properties

      t.references :jit_pl_concept, null: false, foreign_key: true, type: :bigint
      t.timestamps
    end

    # Teaching tips can have video/doc resources attached
    create_join_table :jit_pl_teaching_tips, :resources do |t|
      t.index [:jit_pl_teaching_tip_id, :resource_id], unique: true, name: 'index_teaching_tips_resources_on_tip_and_resource_ids'
      t.index [:resource_id, :jit_pl_teaching_tip_id], unique: true, name: 'index_teaching_tips_resources_on_resource_and_tip_ids'
    end
  end
end
