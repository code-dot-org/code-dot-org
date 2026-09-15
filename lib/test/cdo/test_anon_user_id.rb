# frozen_string_literal: true

require_relative '../test_helper'
require 'cdo/anon_user_id'

describe Cdo::AnonUserId do
  describe '.generate' do
    let(:generate) {Cdo::AnonUserId.generate}

    it 'returns UUID v4' do
      _(generate).must_match Cdo::AnonUserId::FORMAT
    end
  end

  describe '.valid?' do
    let(:valid?) {Cdo::AnonUserId.valid?(input)}
    let(:input) {SecureRandom.uuid}

    it 'returns true for UUID v4' do
      _(valid?).must_equal true
    end

    context 'when value is an uppercase UUID' do
      let(:input) {SecureRandom.uuid.upcase}

      it 'returns true' do
        _(valid?).must_equal true
      end
    end

    context 'when value is another UUID version' do
      let(:input) do
        SecureRandom.uuid.tap {|uuid| uuid[14] = '1'}
      end

      it 'returns false' do
        _(valid?).must_equal false
      end
    end

    context 'when value is a malformed string' do
      let(:input) {'invalid'}

      it 'returns false' do
        _(valid?).must_equal false
      end
    end

    context 'when value is nil' do
      let(:input) {nil}

      it 'returns false' do
        _(valid?).must_equal false
      end
    end

    context 'when value is not a string' do
      let(:input) {123}

      it 'returns false' do
        _(valid?).must_equal false
      end
    end
  end

  describe '.valid_value' do
    let(:valid_value) {Cdo::AnonUserId.valid_value(input)}
    let(:input) {SecureRandom.uuid}

    it 'returns valid anonymous user ID' do
      _(valid_value).must_equal input
    end

    context 'when value is invalid' do
      let(:input) {'invalid'}

      it 'returns nil' do
        _(valid_value).must_be_nil
      end
    end

    context 'when value is nil' do
      let(:input) {nil}

      it 'returns nil' do
        _(valid_value).must_be_nil
      end
    end
  end
end
