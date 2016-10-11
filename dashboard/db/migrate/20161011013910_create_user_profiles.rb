# Establishes the user_profiles table to store information about a user outside
# of the information stored in the users table.
class CreateUserProfiles < ActiveRecord::Migration[5.0]
  def change
    create_table :user_profiles do |t|
      t.belongs_to :user, {null: false}
      t.timestamps
      # The user ID of the user who last (manually) set any of the values for
      # this user profile.
      t.integer :updated_by, default: nil
      # A comma-separated list of other user IDs known to be different accounts
      # for the same person.
      t.string :other_user_ids, default: nil
      # A comma-separated list of other email adddresses known to be alternate
      # email addresses.
      t.string :other_emails, default: nil
      # A boolean indicating whether the person has been {CSF, CSD, CSP, ECS}-
      # PDed, using Code Studio to make this determination.
      t.boolean :csf_pd, default: false
      t.boolean :csd_pd, default: false
      t.boolean :csp_pd, default: false
      t.boolean :ecs_pd, default: false
      # A boolean indicating whether the person has been {CSF, CSD, CSP, ECS}-
      # PDed, using manual human intervention as the source of truth, which
      # itself should reflect payments as closely as possible.
      t.boolean :csf_pd_manual, default: false
      t.boolean :csd_pd_manual, default: false
      t.boolean :csp_pd_manual, default: false
      t.boolean :ecs_pd_manual, default: false
    end
  end
end
