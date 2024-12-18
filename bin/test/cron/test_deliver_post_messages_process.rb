require_relative '../test_helper'
require_relative '../../cron/deliver_poste_messages_process'

describe DeliverPosteMessagesProcess do
  let(:message_queue_length) {10}
  let(:message_queue) do
    Queue.new.tap do |queue|
      message_queue_length.times do |n|
        queue << {
          id: n,
          params: "{\"body\":\"\\u003cp\\u003eHello !\\u003c/p\\u003e\\n\\u003cp\\u003eSomeone has requested a link to change your password. You can do this through the link below any time within the next 7 days.\\u003c/p\\u003e\\n\\u003cp\\u003e\\nChange my password:\\n\\u003ca href=\\\"https://studio.code.org/users/password/edit?reset_password_token=D34DB33F\\\"\\u003ehttps://studio.code.org/users/password/edit?reset_password_token=ofD5yg7dY5g5qCQ7RyBx\\u003c/a\\u003e\\n\\u003c/p\\u003e\\n\\u003cp\\u003eIf you didn\\u0026#39;t request this, please ignore this email.\\u003c/p\\u003e\\n\\u003cp\\u003eYour password won\\u0026#39;t change until you access the link above and create a new one.\\u003c/p\\u003e\\n\",\"subject\":\"Code.org reset password instructions\",\"from\":\"noreply@code.org\",\"reply_to\":\"noreply@code.org\"}",
          created_at: DateTime.parse('2023-12-04 00:00:00 +0000'),
          created_ip: "127.0.0.1",
          sent_at: nil,
          contact_id: 11_111_111,
          contact_email: "test1@example.come",
          message_id: n,
          hashed_email: "751336460babbc50f8616e401bfd185c"
        }
      end
    end
  end
  let(:dashboard_student) {false}

  before do
    Poste.stubs(:dashboard_student?).returns(dashboard_student)
  end

  context '#main' do
    let(:main) {DeliverPosteMessagesProcess.main}

    before do
      DeliverPosteMessagesProcess.stubs(:message_queue).returns(message_queue)
    end

    it 'sends every email' do
      Deliverer.any_instance.expects(:send).times(message_queue_length)
      main
    end

    context 'first send raises exception' do
      let(:expected_error) {nil}

      before do
        Deliverer.any_instance.stubs(:send).raises(expected_error).then.returns(nil)
      end

      context 'Net::SMTPSyntaxError' do
        let(:expected_error) {Net::SMTPSyntaxError.new(nil, message: 'message')}

        it 'send Honeybadger notification' do
          Honeybadger.expects(:notify).once
          main
        end

        it 'successfully sends the rest of the messages' do
          Deliverer.any_instance.expects(:send).times(message_queue_length)
          main
        end
      end

      context 'Net::SMTPFatalError' do
        let(:expected_error) {Net::SMTPFatalError.new(nil, message: 'message')}

        it 'send Honeybadger notification' do
          Honeybadger.expects(:notify).once
          main
        end

        it 'successfully sends the rest of the messages' do
          Deliverer.any_instance.expects(:send).times(message_queue_length)
          main
        end
      end

      context 'AbortEmailError' do
        let(:expected_error) {AbortEmailError}

        it 'send Honeybadger notification' do
          Honeybadger.expects(:notify).once
          main
        end

        it 'successfully sends the rest of the messages' do
          Deliverer.any_instance.expects(:send).times(message_queue_length)
          main
        end
      end

      context 'Psych::SyntaxError' do
        let(:expected_error) {Psych::SyntaxError.new(nil, 0, 0, 0, nil, nil)}

        it 'send Honeybadger notification' do
          Honeybadger.expects(:notify).once
          main
        end

        it 'successfully sends the rest of the messages' do
          Deliverer.any_instance.expects(:send).times(message_queue_length)
          main
        end
      end

      context 'unexpected RuntimeError' do
        let(:expected_error) {RuntimeError.new('unexpected')}

        it 'send Honeybadger notification' do
          Honeybadger.expects(:notify).once
          assert_raises(expected_error.class) {main}
        end

        it 'only sends the one message' do
          Deliverer.any_instance.expects(:send).once
          assert_raises(expected_error.class) {main}
        end

        it 'raises the unexpected exception' do
          actual_error = assert_raises(expected_error.class) {main}
          _(actual_error).must_equal(expected_error)
        end
      end
    end
  end
end
