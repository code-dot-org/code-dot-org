require 'test_helper'

class QueryTest < ActionController::TestCase
  test 'loads sections by ID' do
    query_string = <<-GRAPHQL
      query ($id: ID!) {
        section(id: $id){
          name
          id
        }
      }
    GRAPHQL

    teacher = create(:teacher)
    sign_in teacher
    section = create :section, name: 'AP CS A Period 7', user: teacher

    post :execute, params: {query: query_string}


    puts returned_json.inspect

    #post_result = result["data"]["section"]
    # Make sure the query worked
    #assert_equal section.id, post_result["id"]
    #assert_equal "AP CS A Period 7", post_result["name"]
  end


  def returned_json
    JSON.parse @response.body
  end

end
