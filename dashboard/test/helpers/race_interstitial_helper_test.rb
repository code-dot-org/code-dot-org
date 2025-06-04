require 'test_helper'

class RaceInterstitialHelperTest < ActionView::TestCase
  def mock_geocoder_result(result)
    mock_us_object = OpenStruct.new(country_code: result)
    Geocoder.stubs(:search).returns([mock_us_object])
  end

  describe '.show?' do
    subject(:show?) {RaceInterstitialHelper.show?(user)}
    let(:user) {create(:student, current_sign_in_ip: '127.0.0.1')}
    let!(:sign_in) {create(:sign_in, user: user, sign_in_count: 1, sign_in_at: DateTime.now - 8.days)}
    let!(:geocoder_result) {mock_geocoder_result('US')}

    context 'when teacher' do
      let(:user) {create(:teacher)}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when under 13' do
      let(:user) {create(:student, age: 8)}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when no sign in information' do
      let(:sign_in) {nil}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when signed in for the first time less than a week ago' do
      let(:sign_in) {create(:sign_in, user: user, sign_in_count: 1, sign_in_at: DateTime.now - 3.days)}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when race already present' do
      let(:user) {create(:student, current_sign_in_ip: '127.0.0.1', races: 'white,black')}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when closed dialog already' do
      let(:user) {create(:student, current_sign_in_ip: '127.0.0.1', races: 'closed_dialog')}

      context 'when created after bugfix date' do
        it 'returns true' do
          _(show?).must_equal true
        end
      end

      context 'when created before bugfix date' do
        let(:user) do
          create(:student, current_sign_in_ip: '127.0.0.1', races: 'closed_dialog') do |u|
            u.created_at = Time.new(2022, 5, 1)
          end
        end

        it 'returns false' do
          _(show?).must_equal false
        end
      end
    end

    context 'when IP address is nil' do
      let(:user) {create(:student, current_sign_in_ip: nil)}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when non-US user' do
      let(:geocoder_result) {mock_geocoder_result('CA')}

      it 'returns false' do
        _(show?).must_equal false
      end
    end

    context 'when US user' do
      it 'returns true' do
        _(show?).must_equal true
      end
    end
  end
end
