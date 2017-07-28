class AssignSectionsToCourses < ActiveRecord::Migration[5.0]
  def change
    csp = Course.find_by_name('csp')
    csd = Course.find_by_name('csd')

    # In some scenarios, csd/csp might not have been seeded yet. In that case,
    # there should be no need to run this migration.
    if csp && csd
      csp_script_ids = csp.course_scripts.map(&:script_id)
      csd_script_ids = csd.course_scripts.map(&:script_id)

      Section.where(script_id: csp_script_ids).update_all(course_id: csp.id)
      Section.where(script_id: csd_script_ids).update_all(course_id: csd.id)
    end
  end
end
