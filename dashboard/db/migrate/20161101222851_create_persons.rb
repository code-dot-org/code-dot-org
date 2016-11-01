class CreatePersons < ActiveRecord::Migration[5.0]
  def change
    # The persons table will contain information that spans multiple users, as
    # well as provide a mechanism to link users.
    create_table :persons do |t|
      t.timestamps
      # Though each linked user has an email address, we include this here so as
      # to be able to include email addresses not associated with any Code
      # Studio account.
      t.string :emails
    end

    # Each user now belongs to a person.
    change_table :users do |t|
      t.belongs_to :person, after: :id
    end
  end
end
