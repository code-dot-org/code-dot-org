# frozen_string_literal: true

require 'test_helper'
require 'fakeredis'

class Middlewares::RedisSessionStoreTest < ActiveSupport::TestCase
  let(:redis_session_store) {described_class.new(app)}

  let(:app) {->(_env) {[200, {}, 'success']}}
  let(:request) {ActionDispatch::TestRequest.create}

  let(:session_id) {Rack::Session::SessionId.new(SecureRandom.hex)}
  let(:session_data) {{fake_session_data: 'default'}}
  let(:session_options) {{}}
  let!(:session) {ActionDispatch::Request::Session.create(redis_session_store, request, session_options)}

  before do
    request.cookies['_session_id'] = session_id.to_s
    redis_session_store.write_session(request, session_id, session_data)
  end

  describe '#commit_session?' do
    subject(:commit_session?) {redis_session_store.send(:commit_session?, request, session, options)}

    let(:options) {{}}

    it 'returns false' do
      _commit_session?.must_equal false
    end

    context 'when session is forced to be updated' do
      let(:options) {{max_age: 10.years}}

      before do
        _(redis_session_store.send(:forced_session_update?, session, options)).must_equal true
      end

      it 'returns true' do
        _commit_session?.must_equal true
      end

      context 'if request is an AJAX request' do
        before do
          request.set_header('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest')
          _(request.xhr?).must_equal true
        end

        it 'returns false' do
          _commit_session?.must_equal false
        end

        context 'and session has been changed' do
          before do
            session[:fake_session_data] = 'updated'
            _(session.changed?).must_equal true
          end

          it 'returns true' do
            _commit_session?.must_equal true
          end
        end
      end
    end
  end
end
