# Join table pairing a Pd::Workshop with the CourseOffering it covers.
# This Model exists ONLY to register the table for analytics export.
class CourseOfferingsPdWorkshop < ApplicationRecord
  self.primary_keys = :pd_workshop_id, :course_offering_id

  export_to_analytics

  data_classification(
    pd_workshop_id: :public,
    course_offering_id: :public,
    created_at: :public,
    updated_at: :public,
  )
end
