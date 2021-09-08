class ConvertApplicationClasses < ActiveRecord::Migration[5.2]
  TEACHER_APPLICATION_CLASSES = {
    "2018-2019" => "Pd::Application::Teacher1819Application",
    "2019-2020" => "Pd::Application::Teacher1920Application",
    "2020-2021" => "Pd::Application::Teacher2021Application",
    "2021-2022" => "Pd::Application::Teacher2122Application"
  }
  PRINCIPAL_APPROVAL_APPLICATION_CLASSES = {
    "2018-2019" => "Pd::Application::PrincipalApproval1819Application",
    "2019-2020" => "Pd::Application::PrincipalApproval1920Application",
    "2020-2021" => "Pd::Application::PrincipalApproval2021Application",
    "2021-2022" => "Pd::Application::PrincipalApproval2122Application"
  }

  # Application subclasses were consolidated from year specific classes to a single application class
  # Rails stores a db field 'type' which indicates which ruby class should be associated with the db entry,
  # so these types need to be updated to match the classes that exist.
  def change
    reversible do |dir|
      dir.up do
        # convert Teacher1819Application to TeacherApplication
        ActiveRecord::Base.transaction do
          Pd::Application::ApplicationBase.
            where("type in (?)", TEACHER_APPLICATION_CLASSES.values).
            update_all(type: "Pd::Application::TeacherApplication")
          Pd::Application::ApplicationBase.
            where("type in (?)", PRINCIPAL_APPROVAL_APPLICATION_CLASSES.values).
            update_all(type: "Pd::Application::PrincipalApprovalApplication")
        end
      end

      dir.down do
        # convert TeacherApplication to Teacher1819Application
        ActiveRecord::Base.transaction do
          Pd::Application::ApplicationBase.
            where(type: "Pd::Application::TeacherApplication").each do |application|
            old_type = TEACHER_APPLICATION_CLASSES[application.application_year]
            if old_type
              application.update!(type: old_type)
            else
              # if the old type doesn't exist, i.e. for 2022-2023 in the future, use the most recent class.
              # the application_year will still be correct and unchanged
              application.update!(type: "Pd::Application::Teacher2122Application")
            end
          end

          Pd::Application::ApplicationBase.
            where(type: "Pd::Application::PrincipalApprovalApplication").each do |application|
            old_type = PRINCIPAL_APPROVAL_APPLICATION_CLASSES[application.application_year]
            if old_type
              application.update!(type: old_type)
            else
              application.update!(type: "Pd::Application::PrincipalApproval2122Application")
            end
          end
        end
      end
    end
  end
end
