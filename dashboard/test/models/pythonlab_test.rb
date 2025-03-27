require 'test_helper'

class PythonlabTest < ActiveSupport::TestCase
  test 'can parse serialized_maze' do
    neighborhood_data = {game_id: 72, level_num: "custom", name: "sample_neighborhood"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    neighborhood_data[:properties] = {
      serialized_maze: serialized_maze,
      mini_app: "neighborhood"
    }

    neighborhood_level = Pythonlab.create(neighborhood_data)
    refute_empty(neighborhood_level.serialized_maze)
    assert_equal(2, neighborhood_level.serialized_maze.size)
  end

  test 'neighborhood level requires serialized_maze' do
    neighborhood_data = {game_id: 72, level_num: "custom", name: "sample_neighborhood"}
    neighborhood_data[:properties] = {
      mini_app: "neighborhood"
    }

    assert_raises ArgumentError do
      Pythonlab.create(neighborhood_data)
    end
  end

  test 'get_serialized_maze returns template level maze if level doesnt have one' do
    template_data = {game_id: 72, level_num: "custom", name: "template_neighborhood"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    template_data[:properties] = {
      serialized_maze: serialized_maze,
      mini_app: "neighborhood"
    }
    template_level = Pythonlab.create(template_data)

    neighborhood_data = {game_id: 72, level_num: "custom", name: "sample_neighborhood"}
    neighborhood_data[:properties] = {
      mini_app: "neighborhood",
      project_template_level_name: template_level.name
    }
    neighborhood_level = Pythonlab.create(neighborhood_data)
    assert_equal template_level.get_serialized_maze, neighborhood_level.get_serialized_maze
  end

  test 'Remove neighborhood settings for non-neighborhood levels' do
    level_data = {game_id: 72, level_num: "custom", name: "sample_level"}
    level_data[:properties] = {
      serialized_maze: "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]",
    }
    level = Pythonlab.create(level_data)
    assert_nil(level.serialized_maze)
  end

  test 'Keeps neighborhood settings for neighborhood levels' do
    level_data = {game_id: 72, level_num: "custom", name: "sample_level"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    level_data[:properties] = {
      mini_app: "neighborhood",
      serialized_maze: serialized_maze,
    }
    parsed_maze = JSON.parse(serialized_maze)
    level = Pythonlab.create(level_data)
    assert_equal(parsed_maze, level.serialized_maze)
  end
end
