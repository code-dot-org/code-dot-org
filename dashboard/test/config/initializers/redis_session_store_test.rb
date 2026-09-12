# frozen_string_literal: true

require 'test_helper'
require 'fakeredis'

class RedisSessionStoreTest < ActiveSupport::TestCase
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

  describe '#prepare_session' do
    before do
      request.delete_header(Rack::RACK_SESSION)
    end

    it 'preserves the stored session when upstream middleware reads the Rack session' do
      Rack::Request.new(request.env).session

      prepared_session = redis_session_store.prepare_session(request)

      _(prepared_session).must_be_instance_of ActionDispatch::Request::Session
      _(prepared_session['fake_session_data']).must_equal 'default'
      _(prepared_session.id.public_id).must_equal session_id.public_id
      _(prepared_session.changed?).must_equal false
    end

    it 'merges upstream writes into the stored session' do
      Rack::Request.new(request.env).session[:upstream_value] = 'pending'

      prepared_session = redis_session_store.prepare_session(request)

      _(prepared_session['fake_session_data']).must_equal 'default'
      _(prepared_session['upstream_value']).must_equal 'pending'
      _(prepared_session.id.public_id).must_equal session_id.public_id
      _(prepared_session.changed?).must_equal true
    end

    it 'initializes a new session after an upstream Rack session read' do
      request.cookies.delete('_session_id')
      Rack::Request.new(request.env).session

      prepared_session = redis_session_store.prepare_session(request)
      prepared_session[:new_value] = 'saved'

      _(prepared_session['new_value']).must_equal 'saved'
      _(prepared_session.id).must_be_instance_of Rack::Session::SessionId
    end
  end

  describe '#delete_session' do
    subject(:delete_session) {redis_session_store.delete_session(request, session_id, session.options)}

    let(:session_data) {{deleted: false}}
    let(:session_options) {{renew: false}}

    it 'stores session as deleted' do
      _ {delete_session}.must_change -> {redis_session_store.find_session(request, session_id)},
                                     from: [session_id, {deleted: false}],
                                     to: [session_id, {deleted: true}]
    end

    it 'deletes request session :deleted flag' do
      _ {delete_session}.must_change -> {request.session['deleted']}, from: false, to: nil
    end

    it 'sets session :renew option' do
      _ {delete_session}.must_change -> {request.session.options[:renew]}, from: false, to: true
    end

    context 'when session is skipped' do
      let(:session_options) {{skip: true}}

      it 'does not store session as deleted' do
        _ {delete_session}.must_change -> {redis_session_store.send(:get_session_with_fallback, session_id)},
                                       from: {deleted: false},
                                       to: nil
      end

      it 'does not delete request session :deleted flag' do
        _ {delete_session}.wont_change -> {request.session['deleted']}
      end

      it 'does not set session :renew option' do
        _ {delete_session}.wont_change -> {request.session.options[:renew]}
      end
    end
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

    context 'when session has been changed' do
      before do
        session[:fake_session_data] = 'updated'
        _(session.changed?).must_equal true
      end

      it 'returns true' do
        _commit_session?.must_equal true
      end

      context 'if session has been deleted' do
        before do
          redis_session_store.delete_session(request, session_id, {})
        end

        it 'returns false' do
          _commit_session?.must_equal false
        end

        context 'and it must be renewed' do
          let(:options) {{renew: true}}

          it 'returns true' do
            _commit_session?.must_equal true
          end
        end

        context 'but it is forced to be updated' do
          let(:options) {{max_age: 10.years}}

          before do
            _(redis_session_store.send(:forced_session_update?, session, options)).must_equal true
          end

          it 'returns false' do
            _commit_session?.must_equal false
          end
        end
      end
    end
  end
end
