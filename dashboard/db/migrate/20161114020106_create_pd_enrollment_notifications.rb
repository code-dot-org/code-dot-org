class CreatePdEnrollmentNotifications < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_enrollment_notifications do |t|
      t.timestamps
      t.belongs_to :pd_enrollment, null: false

      # The name of notification: i.e. name of action in Pd::WorkshopMailer
      t.string :name
    end
  end
end
