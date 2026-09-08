# frozen_string_literal: true

require 'test_helper'

class AnonUserIdTest < ActiveSupport::TestCase
  describe '.generate' do
    subject(:generate) {AnonUserId.generate}

    it 'returns UUID v4' do
      _generate.must_match AnonUserId::FORMAT
    end
  end

  describe '.valid?' do
    subject(:valid?) {AnonUserId.valid?(input)}

    let(:input) {Faker::Internet.uuid}

    it 'returns true for UUID v4' do
      _valid?.must_equal true
    end

    context 'when value is an uppercase UUID' do
      let(:input) {Faker::Internet.uuid.upcase}

      it 'returns true' do
        _valid?.must_equal true
      end
    end

    context 'when value is another UUID version' do
      let(:input) do
        Faker::Internet.uuid.tap {|uuid| uuid[14] = '1'}
      end

      it 'returns false' do
        _valid?.must_equal false
      end
    end

    context 'when value is a malformed string' do
      let(:input) {'invalid'}

      it 'returns false' do
        _valid?.must_equal false
      end
    end

    context 'when value is nil' do
      let(:input) {nil}

      it 'returns false' do
        _valid?.must_equal false
      end
    end

    context 'when value is not a string' do
      let(:input) {123}

      it 'returns false' do
        _valid?.must_equal false
      end
    end
  end

  describe '.valid_value' do
    subject(:valid_value) {AnonUserId.valid_value(input)}

    let(:input) {Faker::Internet.uuid}

    it 'returns valid anonymous user ID' do
      _valid_value.must_equal input
    end

    context 'when value is invalid' do
      let(:input) {'invalid'}

      it 'returns nil' do
        _valid_value.must_be_nil
      end
    end

    context 'when value is nil' do
      let(:input) {nil}

      it 'returns nil' do
        _valid_value.must_be_nil
      end
    end
  end
end
