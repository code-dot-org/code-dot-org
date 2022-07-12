class AddApplicationIdToPdEnrollment < ActiveRecord::Migration[5.2]
  def change
    add_column :pd_enrollments, :application_id, :integer

    Pd::Enrollment.where.not(user_id: nil) do |enrollment|
      Pd::Application::ApplicationBase.where(user_id: enrollment.user_id).each do |application|
        if application.try(:pd_workshop_id) == Pd::Enrollment.pd_workshop_id
          Pd::Enrollment.update_attribute(:application_id, application.id)
        end
      end
    end
  end
end
