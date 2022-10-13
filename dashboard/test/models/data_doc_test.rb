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

  test "data docs seed from files correctly" do
    key = 'dataDocKey'
    name = 'Data Doc Name'
    content = 'Data Doc Content'
    data_doc = create :data_doc, key: key, name: name, content: content
    serialized_doc = data_doc.serialize

    original_doc = data_doc.clone.freeze
    data_doc.destroy!

    File.stubs(:read).returns(serialized_doc.to_json)

    new_doc_id = DataDoc.seed_record("test/fixtures/config/data_docs/test-data-doc-guide.json")
    new_guide = DataDoc.find(new_doc_id)
    assert_equal original_doc.attributes.except('id', 'created_at', 'updated_at'),
                 new_guide.attributes.except('id', 'created_at', 'updated_at')
  end
end
