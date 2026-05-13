require 'test_helper'

class CopyUnitJobTest < ActiveJob::TestCase
  setup do
    @levelbuilder = create(:levelbuilder)
    @source_unit = create(:unit, is_migrated: true)
    @args = {
      source_unit_id: @source_unit.id,
      new_unit_name: 'copied-unit-2026',
      destination_unit_group_name: 'dest-group',
      new_level_suffix: '2026',
      user_id: @levelbuilder.id,
    }
    ActionMailer::Base.deliveries.clear
  end

  test 'perform calls clone_migrated_unit with correct args and sends success email' do
    Unit.any_instance.expects(:clone_migrated_unit).with(
      'copied-unit-2026',
      destination_unit_group_name: 'dest-group',
      new_level_suffix: '2026',
    )

    CopyUnitJob.perform_now(**@args)

    assert_equal 1, ActionMailer::Base.deliveries.size
    mail = ActionMailer::Base.deliveries.last
    assert_equal [@levelbuilder.email], mail.to
    assert_match(/copied-unit-2026/, mail.subject)
  end

  test 'perform sends failure email and re-raises when clone_migrated_unit fails' do
    Unit.any_instance.expects(:clone_migrated_unit).raises('boom')

    assert_raises(RuntimeError) do
      CopyUnitJob.perform_now(**@args)
    end

    assert_equal 1, ActionMailer::Base.deliveries.size
    mail = ActionMailer::Base.deliveries.last
    assert_equal [@levelbuilder.email], mail.to
    assert_match(/failed/i, mail.subject)
    assert_match(/boom/, mail.body.to_s)
  end
end
