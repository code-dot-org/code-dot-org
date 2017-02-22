class AddRegionalPartnerOverrideToPdTeacherApplications < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_teacher_applications, :regional_partner_override, :string
  end
end
