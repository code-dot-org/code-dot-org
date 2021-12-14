class UpdateVersionYearOnUnversionedHocScripts2021 < ActiveRecord::Migration[5.2]
  def up
    unless rack_env?(:test)
      ['spelling-bee', 'counting-csc', 'explore-data-1', 'hello-world-food', 'hello-world-animals', 'hello-world-emoji', 'hello-world-retro'].each do |script_name|
        script = Script.find_by(name: script_name)
        next unless script
        script.properties[:version_year] = "unversioned"
        script.save!

        script.course_version
        next unless script.course_version
        script.course_version.display_name = "unversioned"
        script.course_version.key = "unversioned"
        script.course_version.save!
      end
    end
  end

  def down
    unless rack_env?(:test)
      ['spelling-bee', 'counting-csc', 'explore-data-1', 'hello-world-food', 'hello-world-animals', 'hello-world-emoji', 'hello-world-retro'].each do |script_name|
        script = Script.find_by(name: script_name)
        next unless script
        script.properties[:version_year] = "2021"
        script.save!

        script.course_version
        next unless script.course_version
        script.course_version.display_name = "2021"
        script.course_version.key = "2021"
        script.course_version.save!
      end
    end
  end
end
