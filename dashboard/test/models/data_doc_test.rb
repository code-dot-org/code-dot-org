require 'test_helper'

class DataDocTest < ActiveSupport::TestCase
  test "can create data doc" do
    data_doc = create :data_doc
    assert data_doc.name
    assert data_doc.key
  end

  test "data doc key uniqueness ignores casing" do
    create :data_doc, key: 'myBlock', name: 'invalid block'
    assert_raises ActiveRecord::RecordInvalid do
      DataDoc.create!(key: 'myblock', name: 'invalid block')
    end
  end

  test "serialize returns an object with the correct fields" do
    key = 'dataDocKey'
    name = 'Data Doc Name'
    content = 'Data Doc Content'
    data_doc = DataDoc.create!(key: key, name: name, content: content)

    serialized_doc = data_doc.serialize

    assert serialized_doc.is_a? Object
    assert_equal serialized_doc[:key], key
    assert_equal serialized_doc[:name], name
    assert_equal serialized_doc[:content], content
  end
end
