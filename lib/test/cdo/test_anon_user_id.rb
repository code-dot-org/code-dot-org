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

    context 'when value has a non-RFC variant nibble' do
      let(:input) {'37fdc3bf-8392-45d2-0810-7ea304d2d9c9'}

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

    context 'when value has surrounding whitespace' do
      ["\n%s", "%s\n", "%s\r\n", ' %s '].each do |format|
        it "rejects #{format.inspect}" do
          _(Cdo::AnonUserId.valid?(format % SecureRandom.uuid)).must_equal false
        end
      end
    end

    context 'when value is not a string' do
      let(:input) {123}

      it 'returns false' do
        _(valid?).must_equal false
      end
    end
  end

  describe '.clear' do
    let(:anon_user_id) {Cdo::AnonUserId.generate}
    let(:cookies) {{Cdo::AnonUserId::KEY => anon_user_id}}
    let(:session) {{Cdo::AnonUserId::KEY => anon_user_id}}
    let(:cookie_jar) {mock('cookie_jar')}
    let(:request) {stub(cookies:, cookie_jar:, session:)}

    it 'deletes anonymous user ID from cookies and session' do
      cookie_jar.expects(:delete).with(Cdo::AnonUserId::KEY, domain: :all)

      Cdo::AnonUserId.clear(request)

      _(cookies).wont_include Cdo::AnonUserId::KEY
      _(session).wont_include Cdo::AnonUserId::KEY
    end
  end
end
