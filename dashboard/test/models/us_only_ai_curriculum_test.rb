require 'test_helper'

class UsOnlyAiCurriculumTest < ActiveSupport::TestCase
  setup {UsOnlyAiCurriculum.reset_cache!}
  teardown {UsOnlyAiCurriculum.reset_cache!}

  test 'reads the snapshot and answers membership by unit name' do
    names = UsOnlyAiCurriculum.unit_names
    refute_empty names, 'snapshot should not be empty while models are still blocked'
    assert UsOnlyAiCurriculum.include?(names.first)
    refute UsOnlyAiCurriculum.include?('a-unit-that-does-not-exist')
  end

  # The snapshot is only correct while it matches the levels it describes. This
  # is the same comparison rake us_only_ai_curriculum:snapshot makes, so a
  # curriculum change that adds a blocked unit fails here rather than quietly
  # dropping it from what teachers are told.
  test 'snapshot matches the units whose Aichat levels use a US only model' do
    unit = create(:script, name: 'us-only-drift-check')
    lesson = create(:lesson, :with_lesson_group, script: unit)
    level = create(
      :aichat,
      properties: {'aichat_settings' => {'initialCustomizations' => {'selectedModelId' => SharedConstants::AI_CHAT_MODEL_IDS[:GEMINI_2_5_FLASH]}}}
    )
    create(:script_level, script: unit, lesson: lesson, levels: [level])

    assert_includes UsOnlyAiCurriculum.compute_unit_names, 'us-only-drift-check'
  end
end
