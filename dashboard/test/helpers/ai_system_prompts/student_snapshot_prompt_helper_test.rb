require 'test_helper'

class AiSystemPrompts::StudentSnapshotPromptHelperTest < ActionView::TestCase
  setup do
    @student = create(:student)
    @unit = create(:unit)
    @level = create(:level)
  end

  # *****
  # get_code_level_info
  # *****

  test 'get_code_level_info returns the fetched student code as JSON' do
    student_code = {project_id: 'abc123', code_version: nil, student_code: {'main.py' => 'print(1)'}}

    helper = mock('helper')
    ApplicationController.stubs(:helpers).returns(helper)
    helper.stubs(:get_student_code).with(@student.id, @level, @unit.id).returns(student_code)

    result = AiSystemPrompts::StudentSnapshotPromptHelper.get_code_level_info(@level, @student.id, @unit.id)

    assert_equal student_code.to_json, result["Student Response"]
  end

  test 'get_code_level_info treats student code as nil when get_student_code raises' do
    helper = mock('helper')
    ApplicationController.stubs(:helpers).returns(helper)
    helper.stubs(:get_student_code).raises(StandardError.new('S3 fetch failed'))

    result = nil
    assert_nothing_raised do
      result = AiSystemPrompts::StudentSnapshotPromptHelper.get_code_level_info(@level, @student.id, @unit.id)
    end

    assert_nil result["Student Response"]
  end
end
