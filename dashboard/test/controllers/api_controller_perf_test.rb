require 'test_helper'

class ApiControllerPerfTest < ActionDispatch::IntegrationTest
  def setup
    setup_script_cache
  end

  test "section_level_progress" do
    section = create(:section)
    50.times {|_| section.students << create(:student)}

    sign_in section.teacher

    script = Script.find_by_name('algebra')
    assert_queries 61 do
      get '/dashboardapi/section_level_progress', params: {
        section_id: section.id,
        script_id: script.id
      }
    end
    assert_response :success
  end
end
