import React from 'react';
import SectionScriptProgress from './SectionScriptProgress';
import { TestResults } from '@cdo/apps/constants';

// A truncated copy of the scriptData for csp1
const scriptData = {
  "id": 112,
  "name": "csp1",
  "stages": [
    {
      "script_id": 112,
      "script_name": "csp1",
      "script_stages": 17,
      "freeplay_links": [],
      "id": 1360,
      "position": 1,
      "name": "CS Principles Pre-survey",
      "title": "CS Principles Pre-survey",
      "flex_category": "Content",
      "lockable": true,
      "levels": [
        {
          "ids": [
            8986
          ],
          "activeId": 8986,
          "position": 1,
          "kind": "assessment",
          "icon": "fa-check-square-o",
          "is_concept_level": false,
          "title": 1,
          "url": "http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1",
          "freePlay": false,
          "key": "csp-pre-survey-2017-levelgroup",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}",
          "uid": "8986_0"
        },
        {
          "ids": [
            8986
          ],
          "activeId": 8986,
          "position": 2,
          "kind": "assessment",
          "icon": "fa-check-square-o",
          "is_concept_level": false,
          "title": 2,
          "url": "http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/2",
          "freePlay": false,
          "key": "csp-pre-survey-2017-levelgroup",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}",
          "uid": "8986_1"
        },
        {
          "ids": [
            8986
          ],
          "activeId": 8986,
          "position": 3,
          "kind": "assessment",
          "icon": "fa-check-square-o",
          "is_concept_level": false,
          "title": 3,
          "url": "http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/3",
          "freePlay": false,
          "key": "csp-pre-survey-2017-levelgroup",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}",
          "uid": "8986_2"
        },
        {
          "ids": [
            8986
          ],
          "activeId": 8986,
          "position": 4,
          "kind": "assessment",
          "icon": "fa-check-square-o",
          "is_concept_level": false,
          "title": 4,
          "url": "http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/4",
          "freePlay": false,
          "key": "csp-pre-survey-2017-levelgroup",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}",
          "uid": "8986_3"
        },
        {
          "ids": [
            8986
          ],
          "activeId": 8986,
          "position": 5,
          "kind": "assessment",
          "icon": "fa-check-square-o",
          "is_concept_level": false,
          "title": 5,
          "url": "http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/5",
          "freePlay": false,
          "key": "csp-pre-survey-2017-levelgroup",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}",
          "uid": "8986_4"
        }
      ],
      "description_student": "",
      "description_teacher": "",
      "stage_extras_level_url": "http://localhost-studio.code.org:3000/s/csp1/stage/1/extras"
    },
    {
      "script_id": 112,
      "script_name": "csp1",
      "script_stages": 17,
      "freeplay_links": [],
      "id": 920,
      "position": 2,
      "name": "Personal Innovations",
      "title": "Lesson 1: Personal Innovations",
      "flex_category": "Chapter 1: Representing and Transmitting Information",
      "lockable": false,
      "levels": [
        {
          "ids": [
            1379
          ],
          "activeId": 1379,
          "position": 1,
          "kind": "puzzle",
          "icon": "fa-file-text",
          "is_concept_level": true,
          "title": 1,
          "url": "http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/1",
          "freePlay": false,
          "progression": "Lesson Vocabulary & Resources",
          "key": "U1L1 Student Lesson Introduction",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}"
        },
        {
          "ids": [
            5078
          ],
          "activeId": 5078,
          "position": 2,
          "kind": "puzzle",
          "icon": "fa-video-camera",
          "is_concept_level": true,
          "title": 2,
          "url": "http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/2",
          "freePlay": false,
          "progression": "Computer Science is Changing Everything",
          "name": "Computer Science is Changing Everything",
          "key": "Computer Science is Changing Everything",
          "skin": null,
          "videoKey": "csp_cs_is_changing_everything",
          "concepts": "",
          "conceptDifficulty": "{}"
        },
        {
          "ids": [
            8904,
            8905
          ],
          "activeId": 8904,
          "position": 3,
          "kind": "puzzle",
          "icon": "fa-check-square-o",
          "is_concept_level": false,
          "title": 3,
          "url": "http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/3",
          "freePlay": false,
          "progression": "Reflection: starting out in computer science",
          "key": "csp_socialBelonging_control",
          "skin": null,
          "videoKey": null,
          "concepts": "",
          "conceptDifficulty": "{}"
        }
      ],
      "description_student": "",
      "description_teacher": "",
      "lesson_plan_html_url": "//localhost.code.org:3000/curriculum/csp1/1/Teacher",
      "lesson_plan_pdf_url": "//localhost.code.org:3000/curriculum/csp1/1/Teacher.pdf",
      "stage_extras_level_url": "http://localhost-studio.code.org:3000/s/csp1/stage/1/extras"
    },
  ]
};

export default storybook => {
  storybook
    .storiesOf('Progress/SectionScriptProgress', module)
    .addStoryTable([
      {
        name: 'SectionScriptProgress',
        story: () => (
          <SectionScriptProgress
            section={{
              id: 123,
              students: [{
                id: 1,
                name: 'Won',
              }, {
                id: 2,
                name: 'Too'
              }, {
                id: 3,
                name: 'Thea'
              }]
            }}
            scriptData={scriptData}
            studentLevelProgress={{
              1: {
                '8986_0': TestResults.SUBMITTED_RESULT,
                '8986_1': TestResults.SUBMITTED_RESULT,
                '8986_2': TestResults.SUBMITTED_RESULT,
                '8986_3': TestResults.SUBMITTED_RESULT,
                '8986_4': TestResults.SUBMITTED_RESULT,
                1379: TestResults.ALL_PASS
              },
              2: {
                '8986_0': TestResults.SUBMITTED_RESULT,
                '8986_1': TestResults.SUBMITTED_RESULT,
                '8986_2': TestResults.SUBMITTED_RESULT,
                '8986_3': TestResults.SUBMITTED_RESULT,
                '8986_4': TestResults.SUBMITTED_RESULT,
                8904: TestResults.TOO_MANY_BLOCKS_FAIL
              },
              3: {
                '8986_0': TestResults.SUBMITTED_RESULT,
                '8986_1': TestResults.SUBMITTED_RESULT,
                '8986_2': TestResults.SUBMITTED_RESULT,
                '8986_3': TestResults.SUBMITTED_RESULT,
                '8986_4': TestResults.SUBMITTED_RESULT,
              }
            }}
          />
        )
      },
    ]);
};
