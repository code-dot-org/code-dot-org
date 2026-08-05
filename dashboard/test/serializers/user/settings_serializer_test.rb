require 'test_helper'

class User::SettingsSerializerTest < ActiveSupport::TestCase
  describe 'educator profile fields' do
    let(:payload) {User::SettingsSerializer.new(user, country_code: 'US').as_json}

    context 'when the user is a teacher with a school' do
      let(:school) {create(:school, name: 'TEST SCHOOL', school_type: 'public', id: '1', zip: '12345')}
      let(:user) do
        create(:teacher, educator_role: 'school_admin').tap do |teacher|
          create(:user_school_info, user: teacher, school_info: create(:school_info, school: school))
        end
      end

      it 'serializes the educator role' do
        _(payload[:educator_role]).must_equal 'school_admin'
      end

      it 'serializes only the client-facing school fields' do
        _(payload[:school_info]).must_equal(
          school_name: 'Test School',
          school_type: 'public',
          school_id: '1',
          school_zip: '12345',
          country: 'US',
        )
      end

      it 'omits the internal user_school_info_id' do
        _(payload[:school_info].keys).wont_include :user_school_info_id
      end
    end

    # The query is stubbed because a readonly SchoolInfo row cannot be fabricated
    # with a non-String school_id.
    context 'when the query returns a non-String school_id' do
      let(:user) {create(:teacher)}

      it 'stringifies it' do
        Queries::SchoolInfo.stubs(:current_school).with(user).returns(
          school_name: 'Unknown School',
          school_type: nil,
          school_id: 4_100_009,
          school_zip: '12345',
          country: 'US',
          user_school_info_id: 7,
        )

        _(payload[:school_info][:school_id]).must_equal '4100009'
      end

      it 'leaves a nil school_id nil' do
        Queries::SchoolInfo.stubs(:current_school).with(user).returns(
          school_name: 'Unknown School',
          school_type: nil,
          school_id: nil,
          school_zip: '12345',
          country: 'US',
          user_school_info_id: 7,
        )

        _(payload[:school_info][:school_id]).must_be_nil
      end
    end

    context 'when the user is a teacher without a school' do
      let(:user) {create(:teacher, educator_role: 'classroom_teacher')}

      it 'sets school_info to nil but keeps the role fields' do
        _(payload[:school_info]).must_be_nil
        _(payload[:educator_role]).must_equal 'classroom_teacher'
        _(payload).must_include :educator_role_options
      end
    end

    context 'when the teacher has no educator role' do
      let(:user) {create(:teacher)}

      it 'sets educator_role to nil and still lists the options' do
        _(payload).must_include :educator_role
        _(payload[:educator_role]).must_be_nil
        _(payload[:educator_role_options]).wont_be_empty
      end
    end

    context 'when the user is a student' do
      let(:user) {create(:student)}

      it 'omits every educator profile key' do
        _(payload.keys).wont_include :educator_role
        _(payload.keys).wont_include :educator_role_options
        _(payload.keys).wont_include :school_info
      end
    end

    describe 'educator_role_options' do
      let(:user) {create(:teacher)}

      it 'maps the canonical roles to {value, text, category}' do
        _(payload[:educator_role_options].first).must_equal(
          value: 'classroom_teacher',
          text: 'Classroom Teacher',
          category: 'educator',
        )
        _(payload[:educator_role_options].length).must_equal SharedConstants::EDUCATOR_ROLES.length
        payload[:educator_role_options].each do |option|
          _(option.keys.sort).must_equal %i[category text value]
        end
      end
    end
  end
end
