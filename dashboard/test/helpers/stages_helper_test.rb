require 'test_helper'

class StagesHelperTest < ActionView::TestCase
  include ApplicationHelper

  setup do
    @stage = create(:stage, script: create(:script), absolute_position: 5, relative_position: 5)
  end

  test 'should give URL for script level curriculum PDF' do
    assert_includes(@stage.lesson_plan_html_url, "curriculum/#{@stage.script.name}/5/Teacher")
    assert_includes(@stage.lesson_plan_pdf_url, "curriculum/#{@stage.script.name}/5/Teacher.pdf")
  end
end
