class AssignSectionsToCourses < ActiveRecord::Migration[5.0]
  def change
    csp = Course.find_by_name('csp-2017')
    csd = Course.find_by_name('csd-2017')

    # In some scenarios, csd/csp might not have been seeded yet. In that case,
    # there should be no need to run this migration.
    if csp && csd
      csp_script_ids = csp.default_unit_group_units.map(&:script_id)
      csd_script_ids = csd.default_unit_group_units.map(&:script_id)

      Section.where(script_id: csp_script_ids).update_all(course_id: csp.id)
      Section.where(script_id: csd_script_ids).update_all(course_id: csd.id)
    end
  end
end
