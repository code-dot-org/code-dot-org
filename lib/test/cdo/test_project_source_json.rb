# Test project_source_json.rb
require_relative '../test_helper'
require 'cdo/project_source_json'

class ProjectSourceJsonTest < Minitest::Test
  ANIMATION_1_KEY = '7a31e51f-db56-4147-bee3-c5ccc8a71aee'
  ANIMATION_2_KEY = '961474d2-d06d-4c10-941e-79c6bde06d2c'
  EXAMPLE_JSON = %{
    {
      "source":"//comment",
      "animations":{
        "orderedKeys":[
          "#{ANIMATION_1_KEY}",
          "#{ANIMATION_2_KEY}"
        ],
        "propsByKey":{
          "#{ANIMATION_1_KEY}":{
            "name":"pine_trees",
            "sourceUrl":null,
            "frameSize":{
              "x":400,
              "y":400
            },
            "frameCount":1,
            "looping":true,
            "frameDelay":12,
            "version":"_9WUARCAgtYNZf8EZR3HyNVetFkRM5H5"
          },
          "#{ANIMATION_2_KEY}":{
            "name":"sun",
            "sourceUrl":null,
            "frameSize":{
              "x":150,
              "y":150
            },
            "frameCount":2,
            "looping":true,
            "frameDelay":12,
            "version":"Wt3TJpURB1tUZvr6GMyMfyGefEXJI9BM"
          }
        }
      }
    }
  }

  def test_generates_equivalent_json
    psj = ProjectSourceJson.new(EXAMPLE_JSON)
    assert_equal_json EXAMPLE_JSON, psj.to_json
  end

  def test_raise_on_to_json_if_unparseable
    psj = ProjectSourceJson.new("ceci n'est pas du json")
    assert_raises do
      psj.to_json
    end
  end

  def test_iterates_animation_props
    psj = ProjectSourceJson.new(EXAMPLE_JSON)
    iterated_props = []
    psj.each_animation do |props|
      iterated_props.push props
    end
    assert_equal 2, iterated_props.size

    assert_equal_json(
      <<-JSON,
        {
          "name":"pine_trees",
          "sourceUrl":null,
          "frameSize":{
             "x":400,
             "y":400
          },
          "frameCount":1,
          "looping":true,
          "frameDelay":12,
          "version":"_9WUARCAgtYNZf8EZR3HyNVetFkRM5H5",
          "key":"7a31e51f-db56-4147-bee3-c5ccc8a71aee"
        }
      JSON
      iterated_props[0].to_json
    )

    assert_equal_json(
      <<-JSON,
        {
          "name":"sun",
          "sourceUrl":null,
          "frameSize":{
             "x":150,
             "y":150
          },
          "frameCount":2,
          "looping":true,
          "frameDelay":12,
          "version":"Wt3TJpURB1tUZvr6GMyMfyGefEXJI9BM",
          "key":"961474d2-d06d-4c10-941e-79c6bde06d2c"
        }
      JSON
      iterated_props[1].to_json
    )
  end

  def test_iterates_no_animations_if_unparseable
    psj = ProjectSourceJson.new("ceci n'est pas du json")
    iteration_count = 0
    psj.each_animation {|_| iteration_count += 1}
    assert_equal 0, iteration_count
  end

  def test_iterates_no_animations_if_no_manifest
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "source":"//comment"
      }
    JSON
    refute psj.animation_manifest?

    iteration_count = 0
    psj.each_animation {|_| iteration_count += 1}
    assert_equal 0, iteration_count
  end

  def test_can_update_animation_version_in_project_source
    psj = ProjectSourceJson.new(EXAMPLE_JSON)

    initial_manifest = JSON.parse(psj.to_json)['animations']
    initial_animation_1_version = initial_manifest['propsByKey'][ANIMATION_1_KEY]['version']
    initial_animation_2_version = initial_manifest['propsByKey'][ANIMATION_2_KEY]['version']

    psj.set_animation_version(ANIMATION_1_KEY, 'new-key')

    new_manifest = JSON.parse(psj.to_json)['animations']
    new_animation_1_version = new_manifest['propsByKey'][ANIMATION_1_KEY]['version']
    new_animation_2_version = new_manifest['propsByKey'][ANIMATION_2_KEY]['version']

    refute_equal initial_animation_1_version, new_animation_1_version
    assert_equal 'new-key', new_animation_1_version
    assert_equal initial_animation_2_version, new_animation_2_version
  end

  def test_assert_animation_manifest_on_well_formed_manifest
    psj = ProjectSourceJson.new(EXAMPLE_JSON)
    assert psj.animation_manifest?

    # And a minimal example, for illustration
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "animations": {
          "orderedKeys": [],
          "propsByKey": {}
        }
      }
    JSON
    assert psj.animation_manifest?
  end

  def test_refute_animation_manifest_if_missing_or_malformed_manifest
    # No animations key at all
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "source":"//comment"
      }
    JSON
    refute psj.animation_manifest?

    # Animations key isn't an object
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "source":"//comment",
        "animations": "something else"
      }
    JSON
    refute psj.animation_manifest?

    # Animations without orderedKeys or propsByKey
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "source":"//comment",
        "animations": {}
      }
    JSON
    refute psj.animation_manifest?

    # Animations without orderedKeys
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "source":"//comment",
        "animations": {
          "propsByKey": {}
        }
      }
    JSON
    refute psj.animation_manifest?

    # Animations without propsByKey
    psj = ProjectSourceJson.new(<<-JSON)
      {
        "source":"//comment",
        "animations": {
          "orderedKeys": []
        }
      }
    JSON
    refute psj.animation_manifest?
  end

  private

  def assert_equal_json(expected_json, actual_json)
    pretty_expected = JSON.pretty_generate JSON.parse expected_json
    pretty_actual = JSON.pretty_generate JSON.parse actual_json
    assert_equal pretty_expected, pretty_actual
  end
end
