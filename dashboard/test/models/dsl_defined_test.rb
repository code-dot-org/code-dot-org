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
    test_locale = :"te-ST"
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
    test_locale = :"te-ST"
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
end
