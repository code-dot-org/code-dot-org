require 'test_helper'

class Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializerTest < ActiveSupport::TestCase
  test '.as_json with only_numbered_lessons scope returns correct data' do
    script = FactoryBot.build(
      :script,
      name: 'script_name',
      announcements: [
        'key'        => 'announcement_key',
        'notice'     => 'announcement_notice',
        'details'    => 'announcement_details',
        'buttonText' => 'announcement_buttonText',
      ],
      course_version: FactoryBot.build(
        :course_version,
        key: 'script_course_version_key',
        course_offering: FactoryBot.build(
          :course_offering,
          key: 'script_course_offering_key'
        ),
        reference_guides: FactoryBot.build_list(
          :reference_guide, 1,
          key:          'reference_guide_key',
          display_name: 'reference_guide_display_name',
          content:      'reference_guide_content',
          course_version: FactoryBot.build(
            :course_version,
            key: 'reference_guide_course_version_key',
            course_offering: FactoryBot.build(
              :course_offering,
              key: 'reference_guide_course_offering_key'
            )
          )
        ),
      ),
      resources: FactoryBot.build_list(
        :resource, 1,
        key:  'resource_key',
        name: 'resource_name',
        url:  'resource_url',
        type: 'resource_type',
        course_version: FactoryBot.build(
          :course_version,
          key: 'resource_course_version_key',
          course_offering: FactoryBot.build(:course_offering, key: 'resource_course_offering_key')
        )
      ),
      student_resources: FactoryBot.build_list(
        :resource, 1,
        name: 'student_resource_name',
        url:  'student_resource_url',
        type: 'student_resource_type',
        key:  'student_resource_key',
        course_version: FactoryBot.build(
          :course_version,
          key: 'student_resource_course_version_key',
          course_offering: FactoryBot.build(:course_offering, key: 'student_resource_course_offering_key')
        )
      )
    )

    script.lessons.new(
      id:                       0,
      script_id:                1,
      has_lesson_plan:          true,
      name:                     'numbered_lesson_name',
      overview:                 'numbered_lesson_overview',
      preparation:              'numbered_lesson_preparation',
      purpose:                  'numbered_lesson_purpose',
      student_overview:         'numbered_lesson_student_overview',
      assessment_opportunities: 'numbered_lesson_assessment_opportunities',
      lesson_activities:        FactoryBot.build_list(
        :lesson_activity, 1,
        key:               'lesson_activity_key',
        name:              'lesson_activity_name',
        activity_sections: FactoryBot.build_list(
          :activity_section, 1,
          key:              'activity_sections_key',
          name:             'activity_sections_name',
          description:      'activity_sections_description',
          progression_name: 'activity_sections_progression_name',
          tips: [
            'markdown' => 'activity_section_tip_markdown'
          ],
        )
      ),
      objectives: FactoryBot.build_list(
        :objective, 1,
        key:         'objective_key',
        description: 'objective_description',
      ),
      resources: FactoryBot.build_list(
        :resource, 1,
        key:  'numbered_lesson_resource_key',
        name: 'numbered_lesson_resource_name',
        url:  'numbered_lesson_resource_url',
        type: 'numbered_lesson_resource_type',
        course_version: FactoryBot.build(
          :course_version,
          key: 'numbered_lesson_resource_course_version_key',
          course_offering: FactoryBot.build(:course_offering, key: 'numbered_lesson_resource_course_offering_key')
        )
      ),
      vocabularies: FactoryBot.build_list(
        :vocabulary, 1,
        key:        'vocabulary_key',
        word:       'vocabulary_word',
        definition: 'vocabulary_definition',
        course_version: FactoryBot.build(
          :course_version,
          key: 'vocabulary_course_version_key',
          course_offering: FactoryBot.build(:course_offering, key: 'vocabulary_course_offering_key')
        )
      )
    )

    expected_result = {
      URI('https://studio.code.org/s/script_name') => {
        resources: {
          'resource_key/resource_course_offering_key/resource_course_version_key' => {
            name: 'resource_name',
            url:  'resource_url',
            type: 'resource_type'
          }
        },
        student_resources: {
          'student_resource_key/student_resource_course_offering_key/student_resource_course_version_key' => {
            name: 'student_resource_name',
            url:  'student_resource_url',
            type: 'student_resource_type'
          }
        },
        reference_guides: {
          URI('https://studio.code.org/courses/script_course_offering_key-script_course_version_key/guides/reference_guide_key') => {
            display_name: 'reference_guide_display_name',
            content:      'reference_guide_content'
          }
        },
        lessons: {
          URI('https://studio.code.org/s/20-hour/lessons/') => {
            name:                     'numbered_lesson_name',
            assessment_opportunities: 'numbered_lesson_assessment_opportunities',
            overview:                 'numbered_lesson_overview',
            preparation:              'numbered_lesson_preparation',
            purpose:                  'numbered_lesson_purpose',
            student_overview:         'numbered_lesson_student_overview',
            lesson_activities: {
              'lesson_activity_key' => {
                name: 'lesson_activity_name',
                activity_sections: {
                  'activity_sections_key' => {
                    name:             'activity_sections_name',
                    description:      'activity_sections_description',
                    tips:             ['activity_section_tip_markdown'],
                    progression_name: 'activity_sections_progression_name'
                  }
                }
              }
            },
            objectives: {
              'objective_key' => {
                description: 'objective_description'
              }
            },
            resources: {
              'numbered_lesson_resource_key/numbered_lesson_resource_course_offering_key/numbered_lesson_resource_course_version_key' => {
                name: 'numbered_lesson_resource_name',
                url:  'numbered_lesson_resource_url',
                type: 'numbered_lesson_resource_type'
              }
            },
            vocabularies: {
              'vocabulary_key/vocabulary_course_offering_key/vocabulary_course_version_key' => {
                word:       'vocabulary_word',
                definition: 'vocabulary_definition'
              }
            }
          }
        },
        announcements: {
          'announcement_key' => {
            notice:     'announcement_notice',
            details:    'announcement_details',
            buttonText: 'announcement_buttonText'
          }
        }
      }
    }

    actual_result = Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.new(
      script, scope: {only_numbered_lessons: true}
    ).as_json

    assert_equal expected_result, actual_result
  end
end
