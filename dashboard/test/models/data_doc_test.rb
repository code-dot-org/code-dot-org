require 'test_helper'

class DataDocTest < ActiveSupport::TestCase
  test "can create data doc" do
    data_doc = create :data_doc
    assert data_doc.name
    assert data_doc.key
  end

  class KeyConstraintTests < ActiveSupport::TestCase
    test "data doc key cannot be blank" do
      assert_raises ActiveRecord::RecordInvalid do
        DataDoc.create!(key: '', name: 'invalid block')
      end
    end

    test "data doc key cannot have invalid characters" do
      assert_raises ActiveRecord::RecordInvalid do
        DataDoc.create!(key: 'a space character', name: 'invalid block')
      end
    end

    test "data doc key cannot start with a period" do
      assert_raises ActiveRecord::RecordInvalid do
        DataDoc.create!(key: '.key', name: 'invalid block')
      end
    end

    test "data doc key cannot end with a period" do
      assert_raises ActiveRecord::RecordInvalid do
        DataDoc.create!(key: 'key.', name: 'invalid block')
      end
    end

    test "data doc key uniqueness ignores casing" do
      create :data_doc, key: 'myBlock', name: 'invalid block'
      assert_raises ActiveRecord::RecordInvalid do
        DataDoc.create!(key: 'myblock', name: 'invalid block')
      end
    end

    test "data doc key cannot be `new`" do
      assert_raises ActiveRecord::RecordInvalid do
        DataDoc.create!(key: 'new', name: 'invalid block')
      end
    end
  end
end
