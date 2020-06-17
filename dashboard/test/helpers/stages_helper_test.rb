require 'test_helper'

class StagesHelperTest < ActionView::TestCase
  include ApplicationHelper

  setup do
    @lesson = create(:lesson, script: create(:script), absolute_position: 5, relative_position: 5)
  end

  test 'should give URL for script level curriculum PDF' do
    assert_includes(@lesson.lesson_plan_html_url, "curriculum/#{@lesson.script.name}/5/Teacher")
    assert_includes(@lesson.lesson_plan_pdf_url, "curriculum/#{@lesson.script.name}/5/Teacher.pdf")
  end
end
