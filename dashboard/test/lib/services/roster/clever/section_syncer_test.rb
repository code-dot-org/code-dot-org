require 'test_helper'

class Services::Roster::Clever::SectionSyncerTest < ActiveSupport::TestCase
  subject(:described_class) {Services::Roster::Clever::SectionSyncer}
  subject(:described_instance) {described_class.new(teacher:, section:)}

  let(:teacher) {create(:teacher, :with_clever_authentication_option)}
  let(:section) {create(:section, :from_clever, teacher:)}

  it 'inherits from Services::Base' do
    _(described_class.superclass).must_equal ::Services::Base
  end

  describe '#call' do
    subject(:call_service) {described_instance.call}

    let(:clever_students_data) {stub(:clever_students_data)}

    let!(:clever_client_mock) do
      stub(:clever_client, get: nil).tap do |clever_client_mock|
        oauth_token = teacher.authentication_options.find_by(credential_type: AuthenticationOption::CLEVER).data_hash[:oauth_token]
        Clients::CleverRest.stubs(:new).with(oauth_token:).returns(clever_client_mock)
      end
    end

    before do
      clever_client_mock.stubs(:get).with("sections/#{section.clever_id}/students").returns({'data' => clever_students_data})
    end

    it 'returns synced Clever section' do
      synced_clever_section = stub(:synced_clever_section)

      CleverSection.
        expects(:from_service).
        with(section.clever_id, teacher.id, clever_students_data, section.name).
        returns(synced_clever_section)

      _call_service.must_equal synced_clever_section
    end
  end
end
