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
end
