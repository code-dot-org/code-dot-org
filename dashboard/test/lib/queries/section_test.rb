require 'test_helper'

class Queries::SectionTest < ActiveSupport::TestCase
  describe '.cap_affected' do
    subject(:cap_affected_sections) {described_class.cap_affected}

    let(:section) {create(:section)}
    let(:section_student) {create(:cpa_non_compliant_student, :in_grace_period)}

    before do
      create(:follower, section: section, student_user: section_student)
    end

    it 'returns sections with CAP affected students' do
      _cap_affected_sections.must_include section
    end

    context 'when section has no CAP affected followers' do
      let!(:section_student) {create(:student, :with_parent_permission)}

      it 'does not return section' do
        _cap_affected_sections.wont_include section
      end
    end

    describe 'with scope' do
      subject(:cap_affected_sections) {described_class.cap_affected(scope: scope)}

      context 'when section is within provided scope' do
        let(:scope) {Section.where(id: section.id)}

        it 'returns section' do
          _cap_affected_sections.must_include section
        end
      end

      context 'when section is outside provided scope' do
        let(:scope) {Section.where.not(id: section.id)}

        it 'does not return section' do
          _cap_affected_sections.wont_include section
        end
      end
    end

    describe 'with period' do
      subject(:cap_affected_sections) {described_class.cap_affected(period: period)}

      context 'when follower where age gated during provided period' do
        let(:period) {section_student.cap_status_date..}

        it 'returns section' do
          _cap_affected_sections.must_include section
        end
      end

      context 'when follower where age-gated outside provided period' do
        let(:period) {section_student.cap_status_date.since(1.second)..}

        it 'does not return section' do
          _cap_affected_sections.wont_include section
        end
      end
    end
  end
end
