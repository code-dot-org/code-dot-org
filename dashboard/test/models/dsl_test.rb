require 'test_helper'

# Note: There's also a dsl_test in test/dsl. These tests currently don't get run
# and would fail if they did.

class DslTest < ActiveSupport::TestCase
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
  end

  test 'remove property' do
    # mock file so we don't actually write a file, 2x for each "create_from_level_builder"
    input_dsl = "
  name 'my_multi'
  title 'g(y) = y + 2'
  question 'What is the name of this function?'
  content1 'content1'
  right 'g'
  wrong 'y'
  wrong '2'
  "
    input_dsl_without_content = "
  name 'my_multi'
  title 'g(y) = y + 2'
  question 'What is the name of this function?'
  right 'g'
  wrong 'y'
  wrong '2'
  "
    level = Multi.create_from_level_builder({}, {name: 'my_multi', dsl_text: input_dsl})

    level_modified = Multi.create_from_level_builder({}, {name: 'my_multi', dsl_text: input_dsl_without_content})

    assert_equal 'content1', level.properties['content1']
    assert_nil level_modified.properties['content1']
  end

  test 'name should not be modifiable' do
    level = External.create_from_level_builder({}, {dsl_text: "name 'test external'\ntitle 'test'"})
    assert_raises RuntimeError do
      level.update(dsl_text: "name 'new test name'\ntitle 'abc'")
    end
    assert_equal 'test external', level.name
    assert_equal 'test', level.properties['title']
    assert_nil Level.find_by_name('new test name')
  end

  test 'should set serialized_attributes' do
    level = External.create_from_level_builder({}, {dsl_text: "name 'test external 2'"})
    level.update(dsl_text: "name 'test external 2'\ntitle 'abc'", video_key: 'zzz')
    level.reload
    assert_equal 'zzz', level.video_key
    assert_equal 'abc', level.properties['title']
    assert_nil level.properties['name']
  end

  test 'should encrypt when saving in levelbuilder and decrypt when parsing from file' do
    # don't actually write a file, but check that we are writing the encrypted version
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).twice.with do |pathname, contents|
      if pathname.basename.to_s == 'test_external_3.external'
        # make sure we're encrypting the .external file
        contents =~ /^encrypted/
      else
        # second write is the i18n strings .yml file, don't bother checking it
        true
      end
    end

    # first, create it in levelbuilder
    dsl_text = <<DSL
name 'test external 3'
markdown 'regular old markdown'
teacher_markdown 'visible to teachers only'
DSL
    level = External.create_from_level_builder({}, {encrypted: '1', dsl_text: dsl_text})
    assert level.properties['encrypted']
    assert level.encrypted
    assert_equal 'visible to teachers only', level.properties['teacher_markdown']

    encrypted_dsl_text = level.encrypted_dsl_text(dsl_text)

    # remove the existing level so we can try to create it from the encrypted text (instead of updating)
    level.destroy

    # check parsed data
    new_level_data, _ = External.parse(encrypted_dsl_text, 'text_external_3.external', 'test external 3')
    assert new_level_data[:properties]['encrypted']
    assert_equal 'visible to teachers only', new_level_data[:properties][:teacher_markdown]

    # check created level
    new_level = External.setup(new_level_data)
    assert new_level.properties['encrypted']
    assert_equal 'visible to teachers only', new_level.properties['teacher_markdown']
    assert new_level.encrypted
  end
end
