class UpdateApplicationIdInPdEnrollment < ActiveRecord::Migration[5.2]
  def change
    Pd::Enrollment.where.not(user_id: nil).each do |enrollment|
      Pd::Application::ApplicationBase.where(user_id: enrollment.user_id).each do |application|
        if application.try(:pd_workshop_id) == enrollment.pd_workshop_id
          enrollment.update_attribute(:application_id, application.id)
        end
      end
    end
  end
end
