class AddJSONVideoJitPlAssociations < ActiveRecord::Migration[7.0]
  def change
    create_join_table :jit_pl_concepts, :json_videos do |t|
      t.index [:jit_pl_concept_id, :json_video_id], unique: true, name: 'index_concepts_json_videos_on_concept_id_and_video_id'
      t.index [:json_video_id, :jit_pl_concept_id], unique: true, name: 'index_concepts_json_videos_on_video_id_and_concept_id'
    end

    create_join_table :jit_pl_misconceptions, :json_videos do |t|
      t.index [:jit_pl_misconception_id, :json_video_id], unique: true, name: 'index_misconceptions_json_videos_on_misc_id_and_video_id'
      t.index [:json_video_id, :jit_pl_misconception_id], unique: true, name: 'index_misconceptions_json_videos_on_video_id_and_misc_id'
    end

    create_join_table :jit_pl_exemplars, :json_videos do |t|
      t.index [:jit_pl_exemplar_id, :json_video_id], unique: true, name: 'index_exemplars_json_videos_on_exemplar_id_and_video_id'
      t.index [:json_video_id, :jit_pl_exemplar_id], unique: true, name: 'index_exemplars_json_videos_on_video_id_and_exemplar_id'
    end
  end
end
