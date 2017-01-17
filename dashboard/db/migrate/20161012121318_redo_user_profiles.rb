class RedoUserProfiles < ActiveRecord::Migration[5.0]
  def change
    create_table :user_profiles, force: true do |t|
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
      # The course (e.g., 'csf', 'csd', 'csp', 'ecs') to which PD information
      # applies.
      t.string :course
      # The academic year (e.g., '2016-2017') the person was PDed for course,
      # using Code Studio DB information to make this determination.
      t.string :pd, default: nil
      # The academic year (e.g., '2016-2017') the person was PDed for course,
      # using manual intervention to make this determination.
      t.string :pd_manual, default: nil
      # A JSON blob containing further information about the user. At this time,
      # when course == 'csp', this may contain:
      #   facilitator = 'true'
      #   nmsi = 'true'
      #   teals = 'true'
      t.text :properties
    end
  end
end
