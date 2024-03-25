require 'test_helper'

class JavalabTest < ActiveSupport::TestCase
  test 'can parse serialized_maze' do
    neighborhood_data = {game_id: 68, level_num: "custom", name: "sample_neighborhood"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    neighborhood_data[:properties] = {
      serialized_maze: serialized_maze,
      csa_view_mode: "neighborhood"
    }

    neighborhood_level = Javalab.create(neighborhood_data)
    refute_empty(neighborhood_level.serialized_maze)
    assert_equal(2, neighborhood_level.serialized_maze.size)
  end

  test 'neighborhood level requires serialized_maze' do
    neighborhood_data = {game_id: 68, level_num: "custom", name: "sample_neighborhood"}
    neighborhood_data[:properties] = {
      csa_view_mode: "neighborhood"
    }

    assert_raises ArgumentError do
      Javalab.create(neighborhood_data)
    end
  end

  test 'get_serialized_maze returns template level maze if level doesnt have one' do
    template_data = {game_id: 68, level_num: "custom", name: "template_neighborhood"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    template_data[:properties] = {
      serialized_maze: serialized_maze,
      csa_view_mode: "neighborhood"
    }
    template_level = Javalab.create(template_data)

    neighborhood_data = {game_id: 68, level_num: "custom", name: "sample_neighborhood"}
    neighborhood_data[:properties] = {
      csa_view_mode: "neighborhood",
      project_template_level_name: template_level.name
    }
    neighborhood_level = Javalab.create(neighborhood_data)
    assert_equal template_level.get_serialized_maze, neighborhood_level.get_serialized_maze
  end
end
