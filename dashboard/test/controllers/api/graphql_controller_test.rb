require 'test_helper'

class GraphqlControllerTest < ActionController::TestCase
  test 'loads section by ID without instructor' do
    query_string = <<-GRAPHQL
      query ($id: ID!) {
        section(id: $id) {
          name
          id
        }
      }
    GRAPHQL

    teacher = create(:teacher)
    sign_in teacher
    section = create :section, name: 'AP CS A Period 7', user: teacher

    post :execute, params: {query: query_string, variables: { id: section.id }.to_json }

    assert_equal section.name, returned_json['section']['name']
    assert_equal section.id.to_s, returned_json['section']['id']
    refute returned_json['section']['instructors']
  end

  test 'loads section by ID with instructor' do
    query_string = <<-GRAPHQL
      query ($id: ID!) {
        section(id: $id) {
          name
          id
          instructors {
            id
            name
          }
        }
      }
    GRAPHQL

    teacher = create(:teacher)
    sign_in teacher
    section = create :section, name: 'AP CS A Period 7', user: teacher
    coteacher = create(:section_instructor, section: section, instructor: create(:teacher), status: :active)

    post :execute, params: {query: query_string, variables: { id: section.id }.to_json }

    assert_equal section.name, returned_json['section']['name']
    assert_equal section.id.to_s, returned_json['section']['id']
    assert_equal 2, returned_json['section']['instructors'].size
  end

  test 'other section not returned' do
    query_string = <<-GRAPHQL
      query ($id: ID!) {
        section(id: $id) {
          name
          id
          instructors {
            id
            name
          }
        }
      }
    GRAPHQL

    teacher = create(:teacher)
    section = create :section, name: 'AP CS A Period 7', user: teacher

    teacher2 = create(:teacher)
    sign_in teacher2

    post :execute, params: {query: query_string, variables: { id: section.id }.to_json }

    assert_nil returned_json['section']
  end

  def returned_json
    JSON.parse(@response.body)['data']
  end

end
