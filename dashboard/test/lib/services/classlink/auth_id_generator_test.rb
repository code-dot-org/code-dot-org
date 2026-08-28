require 'test_helper'

class Services::Classlink::AuthIdGeneratorTest < ActiveSupport::TestCase
  describe '.call' do
    let(:result) do
      Services::Classlink::AuthIdGenerator.call(
        tenant_id: tenant_id,
        sourced_id: sourced_id
      )
    end

    let(:tenant_id) {'2222'}
    let(:sourced_id) {'5678_T5678-0005'}

    it 'joins tenant_id and sourced_id with a pipe' do
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

    context 'with a blank sourced_id' do
      let(:sourced_id) {''}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end

    context 'with a nil sourced_id' do
      let(:sourced_id) {nil}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end

    context 'with a blank tenant_id' do
      let(:tenant_id) {''}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end

    context 'with a pipe in tenant_id' do
      let(:tenant_id) {'22|22'}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end
  end
end
