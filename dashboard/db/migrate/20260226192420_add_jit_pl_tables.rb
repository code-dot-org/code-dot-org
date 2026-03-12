class AddJitPlTables < ActiveRecord::Migration[7.0]
  def change
    # Represents a teaching concept for just-in-time PL
    create_table :jit_pl_concepts do |t|
      t.string :name
      t.string :display_name
      t.text :properties

      t.timestamps
    end

    # Resources can be created for each concept, containing video/doc links
    create_join_table :jit_pl_concepts, :resources do |t|
      t.index [:jit_pl_concept_id, :resource_id], unique: true, name: 'index_concepts_resources_on_concept_id_and_resource_id'
      t.index [:resource_id, :jit_pl_concept_id], unique: true, name: 'index_concepts_resources_on_resource_id_and_concept_id'
    end

    # Concepts will be linked to lessons in a many-to-many relationship
    create_join_table :jit_pl_concepts, :lessons do |t|
      t.index [:jit_pl_concept_id, :lesson_id], unique: true
      t.index [:lesson_id, :jit_pl_concept_id], unique: true
    end

    # Concepts will also be linked to rubrics in a many-to-many relationship
    create_join_table :jit_pl_concepts, :rubrics do |t|
      t.index [:jit_pl_concept_id, :rubric_id], unique: true
      t.index [:rubric_id, :jit_pl_concept_id], unique: true
    end

    # A concept can contain many common misconceptions to be debunked
    create_table :jit_pl_misconceptions do |t|
      t.string :name
      t.json :ai_context
      t.text :properties

      t.references :jit_pl_concept, null: false, foreign_key: true, type: :bigint
      t.timestamps
    end

    # Misconceptions can have video/doc resources attached
    create_join_table :jit_pl_misconceptions, :resources do |t|
      t.index [:jit_pl_misconception_id, :resource_id], unique: true, name: 'index_misconceptions_resources_on_misconception_and_resource_ids'
      t.index [:resource_id, :jit_pl_misconception_id], unique: true, name: 'index_misconceptions_resources_on_resource_and_misconception_ids'
    end

    # Exemplars can be created to explain either a concept or misconception
    create_table :jit_pl_exemplars do |t|
      t.string :name
      t.text :properties

      t.references :jit_pl_concept, null: true, foreign_key: true, type: :bigint
      t.references :jit_pl_misconception, null: true, foreign_key: true, type: :bigint
      t.timestamps
    end

    # Exemplars can have video/doc resources attached
    create_join_table :jit_pl_exemplars, :resources do |t|
      t.index [:jit_pl_exemplar_id, :resource_id], unique: true, name: 'index_exemplars_resources_on_exemplar_id_and_resource_id'
      t.index [:resource_id, :jit_pl_exemplar_id], unique: true, name: 'index_exemplars_resources_on_resource_id_and_exemplar_id'
    end
  end
end
