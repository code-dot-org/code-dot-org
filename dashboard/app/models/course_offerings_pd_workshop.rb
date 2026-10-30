# Join table pairing a Pd::Workshop with the CourseOffering it covers.
# This Model exists ONLY to register the table for analytics export.
#
# The marker below makes annotaterb skip this file entirely rather than rewrite it. This ensures that
# CI builds don't generate a new annotation and don't get blocked by `check_for_new_file_changes`.
#
# -*- SkipSchemaAnnotations -*-
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
