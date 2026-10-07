# Unlinked teacher tool. Builds the roster CSV that
# /admin/mass-delete-student-progress consumes
#
class ExportStudentDataController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_teacher!
  before_action :prevent_caching

  def show
    sections = current_user.sections_instructed.
      where(demo_type: nil, participant_type: 'student').
      order(:name)

    students_by_section = students_by_section_id(sections.map(&:id))

    @sections_data = sections.map do |section|
      unit_group, units = assignment_for(section)

      {
        id: section.id,
        name: section.name,
        hidden: section.hidden,
        courseName: unit_group&.localized_title,
        units: units,
        students: students_by_section[section.id] || [],
      }
    end
  end

  # family_name is a serialized_attrs field stored in the properties blob, not
  # a real column, so it needs a real User to read through the accessor
  # instead of a plain pluck. Still select only the minimal columns instead of
  # the full user summary.
  private def students_by_section_id(section_ids)
    return {} if section_ids.empty?

    students = User.
      select('users.id, users.username, users.name, users.properties, followers.section_id AS export_section_id').
      joins(:followeds).
      where(followers: {section_id: section_ids, deleted_at: nil}).
      order('users.name').
      to_a.
      uniq {|student| [student.export_section_id, student.id]}

    students.group_by(&:export_section_id).transform_values do |rows|
      rows.map do |student|
        {id: student.id, username: student.username, name: student.name, familyName: student.family_name}
      end
    end
  end

  # Returns [unit_group, units]. A section assigned a course has both course_id
  # and script_id set, so unit_group must be checked first or only the course's
  # current unit is reported. Empty units render the section as unselectable.
  private def assignment_for(section)
    unit_group = section.unit_group

    units =
      if unit_group
        unit_group_units = unit_group.default_unit_group_units.index_by(&:script_id)
        unit_group.units_for_user(current_user).map do |unit|
          unit_summary(unit, unit_group_units[unit.id])
        end
      else
        [section.script].compact.map {|unit| unit_summary(unit, nil)}
      end

    [unit_group, units]
  rescue ActiveRecord::RecordNotFound
    [nil, []]
  end

  private def unit_summary(unit, unit_group_unit)
    {name: unit.name, title: unit.title_for_display(unit_group_unit: unit_group_unit)}
  end
end
