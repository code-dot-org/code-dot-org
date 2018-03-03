class AddFundingTypeToPdWorkshop < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshops, :funding_type, :string

    Pd::Workshop.where(course: Pd::Workshop::COURSE_CSF, funded: true).update_all(
      funding_type: Pd::Workshop::FUNDING_TYPE_FACILITATOR
    )
  end
end
