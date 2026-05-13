class CopyUnitJob < ApplicationJob
  queue_as :default

  def perform(source_unit_id:, new_unit_name:, destination_unit_group_name:, new_level_suffix:, user_id:)
    user = User.find(user_id)
    source_unit = Unit.find(source_unit_id)

    source_unit.clone_migrated_unit(
      new_unit_name,
      destination_unit_group_name: destination_unit_group_name,
      new_level_suffix: new_level_suffix,
    )

    LevelbuilderMailer.unit_copy_completed(user, new_unit_name).deliver_now
  rescue => exception
    LevelbuilderMailer.unit_copy_failed(user, source_unit&.name || source_unit_id.to_s, exception.message).deliver_now if user
    raise
  end
end
