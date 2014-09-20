require 'test_helper'

class StagesHelperTest < ActionView::TestCase
  include ApplicationHelper

  setup do
    @stage = create(:stage, script: create(:script, name:'testing'), position: 5)
  end

  test 'should give URL for script level curriculum PDF' do
    assert_includes(lesson_plan_html_url(@stage), 'curriculum/testing/5/Teacher')
    assert_includes(lesson_plan_pdf_url(@stage), 'curriculum/testing/5/Teacher.pdf')
  end
end
