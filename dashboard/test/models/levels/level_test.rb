require 'test_spec'

class LevelTest < ActiveSupport::TestCase
  describe '#available_callouts' do
    let(:available_callouts) {level.available_callouts(script_level)}

    let(:level) {build(:level)}
    let(:script_level_callout) {build(:callout)}
    let(:script_level) {build(:script_level)}

    let(:level_is_custom) {false}
    let(:level_is_localizable) {false}

    before do
      allow(level).to receive(:custom?).and_return(level_is_custom)
      allow(level).to receive(:should_localize?).and_return(level_is_localizable)

      script_level.callouts = [script_level_callout] if script_level
    end

    it 'returns script level callouts' do
      _(available_callouts).must_equal [script_level_callout]
    end

    context 'when script level is not provided' do
      let(:script_level) {nil}

      it 'returns empty array' do
        _(available_callouts).must_equal []
      end
    end

    context 'when level is custom without callout_json' do
      let(:level_is_custom) {true}

      it 'returns empty array' do
        _(available_callouts).must_equal []
      end
    end

    context 'when level is custom with callout_json' do
      let(:level_is_custom) {true}

      let(:callout_element_id) {'expected_callout_element_id'}
      let(:callout_localization_key) {'expected_callout_localization_json'}
      let(:callout_text) {'expecte_callout_text'}
      let(:callout_qtip_config) {'expectd_callout_qtip_config'}
      let(:callout_on) {'expected_callout_on'}

      before do
        level.callout_json = JSON.dump(
          [
            element_id: callout_element_id,
            localization_key: callout_localization_key,
            callout_text: callout_text,
            qtip_config: callout_qtip_config,
            on: callout_on,
          ]
        )
      end

      it 'returns its callouts' do
        _(available_callouts.size).must_equal 1
        _(available_callouts.first).must_be_kind_of Callout
        assert_attributes available_callouts.first, {
          element_id: callout_element_id,
          localization_key: callout_localization_key,
          callout_text: callout_text,
          qtip_config: callout_qtip_config.to_json,
          on: callout_on,
        }
      end

      context 'if it is localizable and i18n string exists' do
        let(:level_is_localizable) {true}

        let(:callout_localization_key) {''}
        let(:callout_localized_text) {'expected_callout_localized_text'}

        before do
          I18n.backend.store_translations I18n.locale, {
            data: {
              callouts: {
                level.name => {
                  callout_localization_key => callout_localized_text
                }
              }
            }
          }
        end

        it 'returns its callout with localized text' do
          assert_attributes available_callouts.first, {
            localization_key: callout_localization_key,
            callout_text: callout_localized_text,
          }
        end
      end

      context 'if it is localizable but i18n string does not exist' do
        let(:level_is_localizable) {true}

        it 'returns callout with original text' do
          assert_attributes available_callouts.first, {
            localization_key: callout_localization_key,
            callout_text: callout_text,
          }
        end
      end
    end
  end
end
