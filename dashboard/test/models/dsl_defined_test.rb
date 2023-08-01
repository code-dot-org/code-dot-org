require 'test_helper'

class DSLDefinedLevelTest < ActiveSupport::TestCase
  test 'localized_property defaults to property' do
    level = create :match, properties: {
      answers: [{text: "one"}, {text: "two"}, {text: "three"}]
    }

    # Note that we expect the answers to use string keys, even though it was
    # initialized with symbols
    expected = [{'text' => "one"}, {'text' => "two"}, {'text' => "three"}]

    assert_equal level.answers, expected
    assert_equal level.localized_property('answers'), expected
  end

  test 'localized_property can return localized data' do
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "dsls" => {
          "Test DSLDefined" => {
            answers: [{text: "un"}, {text: "deux"}, {text: "troi"}]
          }
        }
      }
    }
    I18n.backend.store_translations test_locale, custom_i18n

    level = create :match, name: "Test DSLDefined", properties: {
      answers: [{text: "one"}, {text: "two"}, {text: "three"}]
    }

    # Note that we again expect string keys
    expected = [{'text' => "un"}, {'text' => "deux"}, {'text' => "troi"}]
    assert_equal level.localized_property('answers'), expected
  end

  test 'localized_property can return partially-localized data' do
    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "dsls" => {
          "Test DSLDefined" => {
            answers: [{text: "un"}, nil, {}]
          }
        }
      }
    }
    I18n.backend.store_translations test_locale, custom_i18n

    level = create :match, name: "Test DSLDefined", properties: {
      answers: [{text: "one"}, {text: "two"}, {text: "three"}]
    }

    # Note that we again expect string keys
    expected = [{'text' => "un"}, {'text' => "two"}, {'text' => "three"}]
    assert_equal level.localized_property('answers'), expected
  end

  test 'cannot create level with default name' do
    e = assert_raises do
      create :match, name: 'unique level name here', properties: {
        answers: [{text: "one"}, {text: "two"}, {text: "three"}]
      }
    end
    assert_includes(e.message, 'Name cannot be the default level name')
  end

  test 'can create level without existing canonical filename' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write)

    # stub out system call looking for existing files in existing_filename method
    DSLDefined.any_instance.stubs(:`).returns('')

    canonical_filepath = Rails.root.join 'config/scripts/my_level_name.external'
    File.stubs(:exist?).with {|filepath| filepath == canonical_filepath}.returns(false)

    level_name = 'my-level name'
    assert External.create_from_level_builder({}, {dsl_text: "name '#{level_name}'"})
  end

  test 'cannot create level with existing canonical filename' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write).raises('must not modify filesystem')

    # stub out system call looking for existing files in existing_filename method
    DSLDefined.any_instance.stubs(:`).returns('')

    canonical_filepath = Rails.root.join 'config/scripts/my_level_name.external'
    File.stubs(:exist?).with {|filepath| filepath == canonical_filepath}.returns(true)

    level_name = 'my-level name'
    e = assert_raises do
      External.create_from_level_builder({}, {dsl_text: "name '#{level_name}'"})
    end
    assert_includes e.message, 'file "config/scripts/my_level_name.external" already exists'
  end
end
