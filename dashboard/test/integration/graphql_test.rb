require 'test_helper'

class GraphqlTest < ActionDispatch::IntegrationTest
  test "should show user" do
    user = create :teacher
    user.permission = UserPermission::AUTHORIZED_TEACHER
    section = create :section, user: user

    query = <<~QUERY
      {
        exampleUser(id: #{user.id}) {
          email
          usingTextMode
          isVerifiedInstructor
          ownedSectionIds
        }
      }
    QUERY
    post '/graphql', params: {query: query}
    assert_response :success

    actual_response = JSON.parse(response.body)
    expected_response = {
      "data" => {
        "exampleUser" => {
          "email" => user.email,
          "usingTextMode" => nil,
          "isVerifiedInstructor" => true,
          "ownedSectionIds" => [
            {
              "id" => section.id,
              "properties" => {}
            }
          ]
        }
      }
    }
    assert_equal JSON.pretty_generate(expected_response), JSON.pretty_generate(actual_response)
    assert_equal expected_response, actual_response
  end
end
