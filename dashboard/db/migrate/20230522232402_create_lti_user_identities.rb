class CreateLtiUserIdentities < ActiveRecord::Migration[6.1]
  def change
    create_table :lti_user_identities do |t|
      t.string :subject, null: false
      t.references :lti_integration, null: false, foreign_key: true, type: :bigint
      t.references :user, null: false, foreign_key: true, type: :integer

      t.timestamps
    end
    add_index :lti_user_identities, :subject
  end
end
