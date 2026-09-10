require 'test_helper'

class Services::Classlink::AuthIdGeneratorTest < ActiveSupport::TestCase
  describe '.call' do
    let(:result) do
      Services::Classlink::AuthIdGenerator.call(
        tenant_id: tenant_id,
        sourced_id: sourced_id,
        classlink_user_id: classlink_user_id
      )
    end

    let(:tenant_id) {'2222'}
    let(:sourced_id) {'5678_T5678-0005'}
    let(:classlink_user_id) {'59777133'}

    it 'joins tenant_id and sourced_id with a pipe' do
      _(result).must_equal '2222|5678_T5678-0005'
    end

    # Pins the reporting rule from both ends: after the blank-SourcedId case
    # stopped reporting, only a malformed tenant_id does, and an edit that
    # reports on every path again would still pass every must_be_nil below.
    it 'reports nothing' do
      Observability::Errors.expects(:report).never
      _(result).must_equal '2222|5678_T5678-0005'
    end

    context 'with an integer tenant_id' do
      let(:tenant_id) {2222}

      it 'normalizes to the same id as the string form' do
        _(result).must_equal "2222|#{sourced_id}"
      end
    end

    context 'with a pipe in sourced_id' do
      # SourcedId is an arbitrary SIS-supplied string; a pipe is legal.
      let(:sourced_id) {'week|end_T-0005'}

      it 'builds the id' do
        _(result).must_equal "#{tenant_id}|#{sourced_id}"
      end

      it 'round-trips through AuthenticationOption::Classlink.parse' do
        _(AuthenticationOption::Classlink.parse(result)).
          must_equal [tenant_id, sourced_id]
      end
    end

    # ClassLink sends no SourcedId for districts that have not enabled
    # OneRoster. Those users have no v2 identifier and never will, so this is
    # routine traffic on every one of their sign-ins: the caller stays on the
    # v1 UserId, and nothing is reported. Reporting here would fire constantly
    # and bury the malformed-tenant_id cases further down.
    context 'with a blank sourced_id' do
      let(:sourced_id) {''}

      it 'returns nil' do
        _(result).must_be_nil
      end

      it 'reports nothing' do
        Observability::Errors.expects(:report).never
        _(result).must_be_nil
      end
    end

    context 'with a nil sourced_id' do
      let(:sourced_id) {nil}

      it 'returns nil' do
        _(result).must_be_nil
      end

      it 'reports nothing' do
        Observability::Errors.expects(:report).never
        _(result).must_be_nil
      end
    end

    # A SourcedId in hand and still no id means tenant_id arrived in a shape
    # ClassLink does not document. Nothing explains it, so it reports.
    context 'with a blank tenant_id' do
      let(:tenant_id) {''}

      it 'returns nil' do
        _(result).must_be_nil
      end

      it 'reports the anomaly' do
        Observability::Errors.expects(:report).with(
          'ClassLink v2 authentication id not built',
          context: {
            classlink_user_id: classlink_user_id,
            tenant_id_blank: true,
            tenant_id_contains_separator: false,
          }
        )
        _(result).must_be_nil
      end
    end

    context 'with a pipe in tenant_id' do
      let(:tenant_id) {'22|22'}

      it 'returns nil' do
        _(result).must_be_nil
      end

      it 'reports the anomaly' do
        Observability::Errors.expects(:report).with(
          'ClassLink v2 authentication id not built',
          context: {
            classlink_user_id: classlink_user_id,
            tenant_id_blank: false,
            tenant_id_contains_separator: true,
          }
        )
        _(result).must_be_nil
      end
    end

    # Precedence, when both components are unusable: the blank sourced_id wins
    # and nothing is reported. A district that sends no SourcedId is the
    # documented state, and it is also the far more common one, so treating the
    # pair as an anomaly would reintroduce exactly the routine-traffic reporting
    # the blank-sourced_id branch exists to avoid.
    context 'with a blank sourced_id and a malformed tenant_id' do
      let(:sourced_id) {''}
      let(:tenant_id) {'22|22'}

      it 'returns nil' do
        _(result).must_be_nil
      end

      it 'reports nothing' do
        Observability::Errors.expects(:report).never
        _(result).must_be_nil
      end
    end
  end
end
