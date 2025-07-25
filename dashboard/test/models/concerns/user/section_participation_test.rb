require 'test_helper'

class SectionParticipationTest < ActiveSupport::TestCase
  describe '#all_sections' do
    subject(:all_sections) {user.all_sections}
    context 'when the user is a student' do
      let(:user) {create :student}

      it 'returns an empty array' do
        _(all_sections).must_equal []
        _(all_sections.length).must_equal 0
      end
    end

    context 'when the user is a teacher' do
      let(:user) {create :teacher}
      let(:secondary_teacher) {create :teacher}

      let!(:section1) {create :section, user: user}
      let!(:section2) {create :section, user: user}
      let!(:section3) {create :section, user: secondary_teacher}

      before do
        create :follower, section: section3, student_user_id: user.id, user: secondary_teacher
      end

      it 'returns sections the user teaches' do
        _(all_sections).must_include section1
        _(all_sections).must_include section2
      end

      it 'returns sections the user is enrolled in as a student' do
        _(all_sections).must_include section3
      end

      it 'returns all sections the user is part of, regardless of role' do
        _(all_sections).must_equal [section1, section2, section3]
        _(all_sections.size).must_equal 3
      end
    end
  end

  describe '#section_courses' do
    let(:teacher) {create :teacher}
    let(:student) {create :student}
    let(:grand_teacher) {create :teacher}
    let(:unit_group) {create :unit_group, name: 'csd'}
    subject(:section_courses) {teacher.section_courses}

    context 'when a teacher exists as a student in a section' do
      let!(:grand_section) {create :section, user: grand_teacher, unit_group: unit_group}
      let(:courses) {section_courses}

      before do
        create :follower, section: grand_section, student_user_id: teacher.id, user: grand_teacher
      end

      it 'returns the courses in which they are a part of' do
        _(courses.length).must_equal 1
        _(courses.first.name).must_equal 'csd'
      end
    end

    context 'when a teacher exists as a teacher in a section' do
      let!(:section) {create :section, user: teacher, unit_group: unit_group}
      let(:courses) {section_courses}

      before do
        create :follower, section: section, student_user_id: student.id, user: teacher
      end

      it 'returns the courses in which they are a part of' do
        _(courses.length).must_equal 1
        _(courses.first.name).must_equal 'csd'
      end
    end

    context 'when a student exists in a section' do
      let!(:section) {create :section, user: teacher, unit_group: unit_group}
      let(:courses) {student.section_courses}

      before do
        create :follower, section: section, student_user_id: student.id, user: teacher
      end

      it 'returns the courses in which they are a part of' do
        _(courses.length).must_equal 1
        _(courses.first.name).must_equal 'csd'
      end
    end
  end

  describe '#sections_as_student_participant' do
    let(:section_teacher) {create :teacher}
    let(:user) {create :user}
    let!(:section1) {create :section, user: section_teacher}
    let!(:section2) {create :section, :teacher_participants, user: section_teacher}
    let!(:section3) {create :section, :facilitator_participants, user: section_teacher}
    subject(:sections_as_student_participant) {user.sections_as_student_participant}

    before do
      create :follower, section: section1, student_user_id: user.id, user: section_teacher
      create :follower, section: section2, student_user_id: user.id, user: section_teacher
      create :follower, section: section3, student_user_id: user.id, user: section_teacher
    end

    context 'when the user is in multiple sections' do
      it 'returns the sections where participation_type is "student"' do
        _(sections_as_student_participant).must_equal [section1]
        _(sections_as_student_participant.length).must_equal 1
      end

      it 'does not return the pl sections' do
        _(sections_as_student_participant).wont_include section2
        _(sections_as_student_participant).wont_include section3
      end
    end
  end

  describe '#sections_as_pl_participant' do
    let(:section_teacher) {create :teacher}
    let(:user) {create :user}
    let!(:section1) {create :section, user: section_teacher}
    let!(:section2) {create :section, :teacher_participants, user: section_teacher}
    let!(:section3) {create :section, :facilitator_participants, user: section_teacher}
    subject(:sections_as_pl_participant) {user.sections_as_pl_participant}

    before do
      create :follower, section: section1, student_user_id: user.id, user: section_teacher
      create :follower, section: section2, student_user_id: user.id, user: section_teacher
      create :follower, section: section3, student_user_id: user.id, user: section_teacher
    end

    context 'when the user is in multiple sections' do
      it 'returns the pl sections' do
        _(sections_as_pl_participant).must_equal [section2, section3]
        _(sections_as_pl_participant.length).must_equal 2
      end

      it 'does not return sections where participation type is "student"' do
        _(sections_as_pl_participant).wont_include section1
      end
    end
  end

  describe '#last_section_id' do
    let(:teacher) {create :teacher}
    let!(:section1) {create :section, user: teacher}
    subject(:last_section_id) {teacher.last_section_id}

    context 'when the teacher has one section' do
      it 'returns the id of that section' do
        _(last_section_id).must_equal section1.id
      end
    end

    context 'when the teacher has multiple sections' do
      let!(:section2) {create :section, user: teacher}
      it 'returns the id of the most recently created section' do
        _(last_section_id).must_equal section2.id
      end
    end

    context 'when the teacher has a hidden section' do
      let!(:section2) {create :section, user: teacher, hidden: true}
      it 'ignored the hidden section' do
        _(last_section_id).must_equal section1.id
      end
    end

    context 'when the teacher has a deleted section' do
      let!(:section2) {create :section, user: teacher}
      before do
        section2.delete
      end
      it 'ignored the deleted section' do
        _(last_section_id).must_equal section1.id
      end
    end

    context 'when the user is a student' do
      let(:student) {create :student}
      let(:teacher) {create :teacher}

      it 'returns nil' do
        create :follower, section: section1
        _(student.last_section_id).must_be_nil
      end
    end
  end
  describe '#last_joined_section' do
    let(:student) {create :student}
    let(:teacher) {create :teacher}
    let!(:section1) {create :section, user: teacher}
    let!(:section2) {create :section, user: teacher}
    let!(:section3) {create :section, user: teacher}

    subject(:last_joined_section) {student.last_joined_section}

    context 'when the student has joined a section' do
      it 'returns the most recently joined section' do
        create :follower, section: section1, student_user_id: student.id, user: teacher
        _(last_joined_section).must_equal section1
      end
    end

    context 'when the student has joined multiple sections' do
      it 'returns the most recently joined section' do
        Timecop.freeze do
          create :follower, section: section1, student_user_id: student.id, user: teacher
          _(student.last_joined_section).must_equal section1

          Timecop.travel 1.second
          create :follower, section: section2, student_user_id: student.id, user: teacher
          _(student.last_joined_section).must_equal section2

          Timecop.travel 1.second
          create :follower, section: section3, student_user_id: student.id, user: teacher
          _(student.last_joined_section).must_equal section3
        end
      end
    end

    context 'when the student has not joined any sections' do
      it 'returns nil' do
        _(last_joined_section).must_be_nil
      end
    end
  end
end
