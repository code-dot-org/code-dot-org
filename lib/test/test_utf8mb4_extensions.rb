require_relative 'test_helper'
require_relative '../utf8mb4_extensions'

describe CoreExtensions::String::Utf8mb4 do
  let(:string) {"foobar"}

  describe '.utf8mb4?' do
    let(:utf8mb4?) {string.utf8mb4?}

    context 'string has only latin characters' do
      it 'returns false' do
        _(utf8mb4?).must_equal false
      end
    end

    context 'string has some three-byte characters' do
      let(:string) {"汉语"}

      it 'returns false' do
        _(utf8mb4?).must_equal false
      end
    end

    context 'string has a four-byte character' do
      let(:string) {"汉𥚃语"}

      it 'returns true' do
        _(utf8mb4?).must_equal true
      end
    end
  end

  describe '.strip_utf8mb4' do
    let(:strip_utf8mb4) {string.strip_utf8mb4}

    context 'string has only latin characters' do
      it 'returns the same string' do
        _(strip_utf8mb4).must_equal string
      end
    end

    context 'string has some three-byte characters' do
      let(:string) {"汉语"}

      it 'returns the same string' do
        _(strip_utf8mb4).must_equal string
      end
    end

    context 'string has a four-byte character' do
      let(:string) {"汉𥚃语"}

      it 'returns a truncated string' do
        _(strip_utf8mb4).must_equal "汉语"
      end
    end
  end

  describe '.sanitize_utf8mb4' do
    let(:sanitize_utf8mb4) {string.sanitize_utf8mb4}

    context 'string has only latin characters' do
      it 'returns the same string' do
        _(sanitize_utf8mb4).must_equal string
      end
    end

    context 'string has some three-byte characters' do
      let(:string) {"汉语"}

      it 'returns the same string' do
        _(sanitize_utf8mb4).must_equal string
      end
    end

    context 'string has a four-byte character' do
      let(:string) {"汉𥚃语"}

      it 'returns an altered string' do
        _(sanitize_utf8mb4).must_equal "汉?语"
      end
    end
  end
end
