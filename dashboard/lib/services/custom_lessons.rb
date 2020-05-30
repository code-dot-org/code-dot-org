class Services::CustomLessons
  def self.create_custom_applab_level(user)
    # TODO: wrap steps 1 - 3 in a transaction

    # 1. creates a custom_script for the user, if they do not have one already
    if user.custom_script.nil?
      script_name = "#{user.username}-#{SecureRandom.uuid}"
      user.create_custom_script(name: script_name, owner: user)
      user.save!
      user.reload
      user.custom_script.lesson_groups.create(
        key: '',
        user_facing: false,
        position: 1
      )
    end

    lesson_group = user.custom_script.lesson_groups.first
    last_lesson = lesson_group.lessons.last
    new_position = last_lesson ? last_lesson.relative_position + 1 : 1

    # 2. creates a custom level for the user
    level_name = "#{user.username}-#{SecureRandom.uuid}"
    display_name = "Lesson #{new_position} Level"
    new_level = user.custom_levels.create(
      name: level_name,
      type: 'Applab',
      game: Game.applab,
      properties: {display_name: display_name}
    )

    # 3. puts the new custom level inside a new lesson in the custom_script
    new_lesson = lesson_group.lessons.create(
      absolute_position: new_position,
      relative_position: new_position,
      name: "My Lesson #{new_position}",
      script: user.custom_script
    )
    new_lesson.script_levels.create(
      script: user.custom_script,
      levels: [new_level],
      position: 1,
      # TODO: before launch, use progression instead of named_level.
      # for now, make it so that the level edit page can be used to control how
      # the progression name appears on the script overview page.
      named_level: true
    )
  end
end
