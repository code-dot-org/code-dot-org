class BackfillPdAcceptedPrograms < ActiveRecord::Migration[5.0]
  def up
    # Create a Pd::AcceptedProgram for every application with an accepted_workshop
    Pd::TeacherApplication.find_each do |application|
      accepted_workshop = application.read_attribute(:accepted_workshop)
      if accepted_workshop
        Pd::AcceptedProgram.create(
          workshop_name: accepted_workshop,
          course: application.selected_course,
          user_id: application.user_id,
          teacher_application_id: application.id
        )
      end
    end

    remove_column :pd_teacher_applications, :accepted_workshop, :string
  end

  def down
    add_column :pd_teacher_applications, :accepted_workshop, :string

    # Re-write accepted workshops to the pd_teacher_applications table
    Pd::TeacherApplication.find_each do |application|
      accepted_program = application.accepted_program
      application.write_attribute(:accepted_workshop, accepted_program) if accepted_program
    end
  end
end
