import React from 'react';
import {registerReducers, createStoreWithReducers} from '@cdo/apps/redux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import sectionProgress, {
  addDataByScript,
  setLessonOfInterest,
  setShowSectionProgressDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection, {
  setValidScripts
} from '@cdo/apps/redux/scriptSelectionRedux';
import locales from '@cdo/apps/redux/localesRedux';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {TestResults} from '@cdo/apps/constants';
import {lessonProgressForSection} from '@cdo/apps/templates/progress/progressHelpers';

export function fakeRowsForStudents(students) {
  const rows = [];
  students.forEach(student => {
    rows.push({
      id: `${student.id}.0`,
      student: student,
      expansionIndex: 0,
      isExpanded: false
    });
  });
  return rows;
}

export function fakeDetailRowsForStudent(student) {
  return [
    {id: `${student.id}.1`, student: student, expansionIndex: 1},
    {id: `${student.id}.2`, student: student, expansionIndex: 2}
  ];
}

export function wrapTable(table) {
  return (
    <div
      className="main"
      style={{
        marginLeft: 80,
        width: 970,
        display: 'block',
        backgroundColor: '#ffffff'
      }}
    >
      {table}
    </div>
  );
}

export function createStore(numStudents, numLessons) {
  const scriptData = getScriptData(numLessons);
  const section = {
    id: 11,
    script: scriptData,
    students: [],
    lessonExtras: false
  };
  for (let i = 0; i < numStudents; i++) {
    section.students.push({id: i, name: 'Student' + i + ' Long Lastname'});
  }
  try {
    registerReducers({
      sectionProgress,
      sectionData,
      scriptSelection,
      locales
    });
  } catch {}
  const store = createStoreWithReducers();
  store.dispatch(setSection(section));
  store.dispatch(setValidScripts([scriptData], [scriptData.id], [], section));
  store.dispatch(
    addDataByScript(buildSectionProgress(section.students, scriptData))
  );
  store.dispatch(setLessonOfInterest(0));
  store.dispatch(setShowSectionProgressDetails(true));
  return store;
}

function buildSectionProgress(students, scriptData) {
  const lastUpdates = {[scriptData.id]: {}};
  const progress = {};

  students.forEach(student => {
    lastUpdates[scriptData.id][student.id] = Date.now();
    progress[student.id] = {};
  });

  scriptData.lessons.forEach(lesson => {
    lesson.levels.forEach(level => {
      students.forEach(student => {
        progress[student.id][level.id] = randomProgress();
        level.sublevels &&
          level.sublevels.forEach(sublevel => {
            progress[student.id][sublevel.id] = randomProgress();
          });
      });
    });
  });
  return {
    scriptDataByScript: {[scriptData.id]: scriptData},
    studentLevelProgressByScript: {[scriptData.id]: progress},
    studentLessonProgressByScript: {
      [scriptData.id]: lessonProgressForSection(progress, scriptData.lessons)
    },
    studentLastUpdateByScript: {[scriptData.id]: lastUpdates}
  };
}

function randomProgress() {
  const rand = Math.floor(Math.random() * 4);
  const paired = Math.floor(Math.random() * 10) === 0;
  const timeSpent = Math.random() * 60 * 60;
  switch (rand) {
    case 0:
      return {
        status: LevelStatus.perfect,
        locked: false,
        result: TestResults.MINIMUM_OPTIMAL_RESULT,
        paired: paired,
        timeSpent: timeSpent,
        lastTimestamp: Date.now()
      };
    case 1:
      return {
        status: LevelStatus.attempted,
        locked: false,
        result: TestResults.LEVEL_STARTED,
        paired: paired,
        timeSpent: timeSpent,
        lastTimestamp: Date.now()
      };
    case 2:
      return {
        status: LevelStatus.passed,
        locked: false,
        result: TestResults.TOO_MANY_BLOCKS_FAIL,
        paired: paired,
        timeSpent: undefined,
        lastTimestamp: Date.now()
      };
    default:
      return null;
  }
}

function getScriptData(numLessons) {
  return {
    id: 162,
    csf: false,
    hasStandards: false,
    title: "CSD Unit 3 - Interactive Animations and Games ('20-'21)",
    path: '//localhost-studio.code.org:3000/s/csd3-2020',
    lessons: [
      {
        script_id: 162,
        script_name: 'coursea-2020',
        num_script_lessons: 12,
        id: 722,
        position: 0,
        relative_position: 0,
        name: 'Safety in My Online Neighborhood',
        key: 'Safety in My Online Neighborhood',
        assessment: null,
        title: 'Lesson 1: Safety in My Online Neighborhood',
        lesson_group_display_name: 'Digital Citizenship',
        lockable: false,
        levels: [
          {
            id: '16231',
            url:
              'http://localhost-studio.code.org:3000/s/coursea-2020/stage/1/puzzle/1',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: true,
            levelNumber: 1,
            isConceptLevel: true,
            bonus: null
          }
        ],
        description_student: 'Learn how to go places safely online.',
        description_teacher:
          '{: style="padding:10px 0"}This lesson was originally created by .The power of the internet allows students to experience and visit places they might not be able to see in person. But, just like traveling in the real world, it\'s important to be safe when traveling online. On this virtual field trip, kids can practice staying safe on online adventures.',
        unplugged: true,
        lesson_plan_html_url: 'https://curriculum.code.org/csf-20/coursea/1',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/coursea-2020/1/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/coursea-2020/stage/1/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1555,
        position: 1,
        relative_position: 1,
        name: 'Programming for Entertainment',
        key: 'Programming for Entertainment',
        assessment: false,
        title: 'Lesson 1: Programming for Entertainment',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3226',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '16010',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/puzzle/2',
            progression: 'Exploring CS in Entertainment',
            progressionDisplayName: 'Exploring CS in Entertainment',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1785',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/puzzle/3',
            progression: 'Sample Programs',
            progressionDisplayName: 'Sample Programs',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1779',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/puzzle/4',
            progression: 'Sample Programs',
            progressionDisplayName: 'Sample Programs',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1767',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/puzzle/5',
            progression: 'Sample Programs',
            progressionDisplayName: 'Sample Programs',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1773',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/puzzle/6',
            progression: 'Sample Programs',
            progressionDisplayName: 'Sample Programs',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          'Question of the Day: How is computer science used in entertainment?The class is asked to consider the "problems" of boredom and self expression, and to reflect on how they approach those problems in their own lives. From there, they will explore how Computer Science in general, and programming specifically, plays a role in either a specific form of entertainment or as a vehicle for self expression.',
        description_teacher:
          'Question of the Day: How is computer science used in entertainment?Students are asked to consider the "problems" of boredom and self expression, and to reflect on how they approach those problems in their own lives. From there, students will explore how Computer Science in general, and programming specifically, plays a role in either a specific form of entertainment or as a vehicle for self expression.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/1',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/1/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1556,
        position: 2,
        relative_position: 2,
        name: 'Plotting Shapes',
        key: 'Plotting Shapes',
        assessment: false,
        title: 'Lesson 2: Plotting Shapes',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3231',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/2/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2106',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/2/puzzle/2',
            progression: 'Drawing Shapes',
            progressionDisplayName: 'Drawing Shapes',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          "Question of the Day: How can we clearly communicate how to draw something on a screen?This lesson explores the challenges of communicating how to draw with shapes and use a tool that introduces how this problem is approached in Game Lab.The class uses a Game Lab tool  to interactively place shapes on Game Lab's 400 by 400 grid. Partners then take turns instructing each other how to draw a hidden image using this tool, accounting for many of the challenges of programming in Game Lab.",
        description_teacher:
          "Question of the Day: How can we clearly communicate how to draw something on a screen?Students explore the challenges of communicating how to draw with shapes and use a tool that introduces how this problem is approached in Game Lab. The warm up activity quickly demonstrates the challenges of communicating position without some shared reference point. In the main activity students explore a Game Lab tool that allows students to interactively place shapes on Game Lab's 400 by 400 grid. They then take turns instructing a partner how to draw a hidden image using this tool, accounting for many challenges students will encounter when programming in Game Lab. Students optionally create their own image to communicate before a debrief discussion.",
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/2',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/2/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/2/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1557,
        position: 3,
        relative_position: 3,
        name: 'Drawing in Game Lab',
        key: 'Drawing in Game Lab',
        assessment: false,
        title: 'Lesson 3: Drawing in Game Lab',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3236',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '3191',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/2',
            progression: 'Introduction to Game Lab',
            progressionDisplayName: 'Introduction to Game Lab',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4477',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/3',
            progression: 'Video: Drawing in Game Lab - Part 1',
            progressionDisplayName: 'Video: Drawing in Game Lab - Part 1',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1755',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/4',
            progression: 'Using the Grid',
            progressionDisplayName: 'Using the Grid',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4483',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/5',
            progression: 'Video: Drawing in Game Lab - Part 2',
            progressionDisplayName: 'Video: Drawing in Game Lab - Part 2',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2923',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3197',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/7',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2917',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/8',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21573',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/9',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2910',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/9/sublevel/1',
                name: 'CSD U3 drawing practice 1',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2911',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/9/sublevel/2',
                name: 'CSD U3 drawing practice 2',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2912',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/9/sublevel/3',
                name: 'CSD U3 drawing practice 3',
                icon: null,
                bubbleText: 'c'
              }
            ]
          },
          {
            id: '2902',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/10',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21570',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2906',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/1',
                name: 'CSD U3 drawing challenge 2',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2907',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/2',
                name: 'CSD U3 drawing challenge 3',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2909',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/3',
                name: 'CSD U3 drawing challenge no fill_pilot',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '3047',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/4',
                name: 'CSD U3 picture_pilot',
                icon: null,
                bubbleText: 'd'
              },
              {
                id: '2704',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/5',
                name: 'CSD U3 challenge face_pilot',
                icon: null,
                bubbleText: 'e'
              },
              {
                id: '2709',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/6',
                name: 'CSD U3 challenge new shape_pilot',
                icon: null,
                bubbleText: 'f'
              },
              {
                id: '2018',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/puzzle/11/sublevel/7',
                name: 'CSD U3 L3 Freeplay_pilot',
                icon: null,
                bubbleText: 'g'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can we communicate to a computer how to draw shapes on the screen?The class is introduced to Game Lab, the programming environment for this unit, and begins to use it to position shapes on the screen. The lesson covers the basics of sequencing and debugging, as well as a few simple commands.  At the end of the lesson, students will be able to program images like the ones they made with the drawing tool in the previous lesson.',
        description_teacher:
          'Question of the Day: How can we communicate to a computer how to draw shapes on the screen?Students are introduced to Game Lab, the programming environment for this unit, and begin to use it to position shapes on the screen. They learn the basics of sequencing and debugging, as well as a few simple commands. At the end of the lesson, students will be able to program images like the ones they made with the drawing tool in the previous lesson.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/3',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/3/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/3/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1558,
        position: 4,
        relative_position: 4,
        name: 'Shapes and Parameters',
        key: 'Shapes and Parameters',
        assessment: false,
        title: 'Lesson 4: Shapes and Parameters',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3241',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2147',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/2',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2132',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2162',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2157',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2125',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21516',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/7',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '3206',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/7/sublevel/1',
                name: 'CSD U3 shapes behind_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '3208',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/7/sublevel/2',
                name: 'CSD U3 shapes missing_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '3210',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/7/sublevel/3',
                name: 'CSD U3 shapes scene_pilot',
                icon: null,
                bubbleText: 'c'
              }
            ]
          },
          {
            id: '2119',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/8',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21513',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/9',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '3209',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/9/sublevel/1',
                name: 'CSD U3 shapes polygon_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '3211',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/9/sublevel/2',
                name: 'CSD U3 shapes_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '3207',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/9/sublevel/3',
                name: 'CSD U3 shapes line_pilot',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '3205',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/9/sublevel/4',
                name: 'CSD U3 shapes arc_pilot',
                icon: null,
                bubbleText: 'd'
              },
              {
                id: '3042',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/puzzle/9/sublevel/5',
                name: 'CSD U3 parameters shape scene_2020',
                icon: null,
                bubbleText: 'e'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day:  How can we use parameters to give the computer more specific instructions?In this lesson the class continues to develop a familiarity with Game Lab by manipulating the width and height of the shapes they use to draw. The lesson kicks off with a discussion that connects expanded block functionality (e.g. different sized shapes) with the need for more block inputs, or "parameters". The class learns to draw with versions of <code>ellipse()</code> and <code>rect()</code> that include width and height parameters and to use the <code>background()</code> block.',
        description_teacher:
          'Question of the Day:  How can we use parameters to give the computer more specific instructions?In this lesson students continue to develop their familiarity with Game Lab by manipulating the width and height of the shapes they use to draw. The lesson kicks off with a discussion that connects expanded block functionality (e.g. different sized shapes) with the need for more block inputs, or "parameters". Students learn to draw with versions of <code>ellipse()</code> and <code>rect()</code> that include width and height parameters. They also learn to use the <code>background()</code> block.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/4',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/4/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/4/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1559,
        position: 5,
        relative_position: 5,
        name: 'Variables',
        key: 'Variables',
        assessment: false,
        title: 'Lesson 5: Variables',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3246',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2419',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '7593',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/3',
            progression: 'Video: Introduction to Variables',
            progressionDisplayName: 'Video: Introduction to Variables',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2414',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2453',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2392',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21542',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/7',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2437',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/7/sublevel/1',
                name: 'CSD U3 Variables change circle size_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2448',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/7/sublevel/2',
                name: 'CSD U3 Variables names_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2469',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/7/sublevel/3',
                name: 'CSD U3 Variables unused_pilot',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '2444',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/7/sublevel/4',
                name: 'CSD U3 Variables forbidden names_pilot',
                icon: null,
                bubbleText: 'd'
              }
            ]
          },
          {
            id: '2432',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/8',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21539',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/9',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2387',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/9/sublevel/1',
                name: 'CSD U3 Variables Draw Challenge_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2382',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/9/sublevel/2',
                name: 'CSD U3 Variables Challenge_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2429',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/9/sublevel/3',
                name: 'CSD U3 Variables String Challenge_pilot',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '2028',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/puzzle/9/sublevel/4',
                name: 'CSD U3 L5 Freeplay_pilot',
                icon: null,
                bubbleText: 'd'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day:  How can we use variables to store information in our programs?This lesson introduces variables as a way to label a number in a program or save a randomly generated value. The class begins the lesson with a very basic description of the purpose of a variable and practices using the new blocks, then completes a level progression that reinforces the model of a variable as a way to label or name a number.',
        description_teacher:
          'Question of the Day:  How can we use variables to store information in our programs?In this lesson students learn how to use variables to label a number. Students begin the lesson with a very basic description of the purpose of a variable within the context of the storage component of the input-output-storage-processing model. Students then complete a level progression that reinforces the model of a variable as a way to label or name a number.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/5',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/5/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/5/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1560,
        position: 6,
        relative_position: 6,
        name: 'Random Numbers',
        key: 'Random Numbers',
        assessment: false,
        title: 'Lesson 6: Random Numbers',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3251',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2187',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/2',
            progression: 'Exploration',
            progressionDisplayName: 'Exploration',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2182',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2466',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2461',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21530',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/6',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2168',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/6/sublevel/1',
                name: 'CSD U3 Random planets_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2192',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/6/sublevel/2',
                name: 'CSD U3 Random shape position_pilot',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '2173',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/7',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21527',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2190',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8/sublevel/1',
                name: 'CSD U3 Random rgb_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2151',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8/sublevel/2',
                name: 'CSD U3 Random add_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2167',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8/sublevel/3',
                name: 'CSD U3 Random multiply_pilot',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '2166',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8/sublevel/4',
                name: 'CSD U3 Random line_pilot',
                icon: null,
                bubbleText: 'd'
              },
              {
                id: '2152',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8/sublevel/5',
                name: 'CSD U3 Random arc_pilot',
                icon: null,
                bubbleText: 'e'
              },
              {
                id: '2165',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/puzzle/8/sublevel/6',
                name: 'CSD U3 Random free play_pilot',
                icon: null,
                bubbleText: 'f'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can we make our programs behave differently each time they are run?The class is introduced to the <code>randomNumber()</code> block and how it can be used to create new behaviors in their programs.  They then learn how to update variables during a program and use those skills to draw randomized images.',
        description_teacher:
          'Question of the Day: How can we make our programs behave differently each time they are run?Students are introduced to the <code>randomNumber()</code> block and how it can be used to create new behaviors in their programs.  They them learn how to update variables during a program.  Combining all of these skills students draw randomized images.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/6',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/6/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/6/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1561,
        position: 7,
        relative_position: 7,
        name: 'Sprites',
        key: 'Sprites',
        assessment: false,
        title: 'Lesson 7: Sprites',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3256',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2229',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/2',
            progression: 'Exploration',
            progressionDisplayName: 'Exploration',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4510',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/3',
            progression: 'Video: Introduction to Sprites',
            progressionDisplayName: 'Video: Introduction to Sprites',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2282',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2270',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2241',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4468',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/7',
            progression: 'Video: The Animation Tab',
            progressionDisplayName: 'Video: The Animation Tab',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2328',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/8',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '18424',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/9',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21536',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2287',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10/sublevel/1',
                name: 'CSD U3 Sprites missing_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2290',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10/sublevel/2',
                name: 'CSD U3 Sprites names_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2289',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10/sublevel/3',
                name: 'CSD U3 Sprites name sprite_pilot',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '2292',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10/sublevel/4',
                name: 'CSD U3 Sprites order_pilot',
                icon: null,
                bubbleText: 'd'
              },
              {
                id: '2266',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10/sublevel/5',
                name: 'CSD U3 Sprites fish_pilot',
                icon: null,
                bubbleText: 'e'
              },
              {
                id: '2332',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/10/sublevel/6',
                name: 'CSD U3 Sprites sprite draw_pilot',
                icon: null,
                bubbleText: 'f'
              }
            ]
          },
          {
            id: '2256',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/11',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21533',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/12',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 12,
            bubbleText: '12',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2247',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/12/sublevel/1',
                name: 'CSD U3 Sprites anitab 2_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2264',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/12/sublevel/2',
                name: 'CSD U3 Sprites draw animation_pilot',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2258',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/puzzle/12/sublevel/3',
                name: 'CSD U3 Sprites combine_pilot',
                icon: null,
                bubbleText: 'c'
              }
            ]
          }
        ],
        description_student: '',
        description_teacher: '',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/7',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/7/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/7/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1562,
        position: 8,
        relative_position: 8,
        name: 'Sprite Properties',
        key: 'Sprite Properties',
        assessment: false,
        title: 'Lesson 8: Sprite Properties',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3261',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '725',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '729',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '722',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21524',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/5',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '715',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/5/sublevel/1',
                name: 'CSD Games bubble choice properties scale',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '714',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/5/sublevel/2',
                name: 'CSD Games bubble choice properties rotation',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '719',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/6',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21521',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/7',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '3187',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/7/sublevel/1',
                name: 'CSD U3 properties tint_pilot',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '3185',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/puzzle/7/sublevel/2',
                name: 'CSD U3 properties depth_pilot',
                icon: null,
                bubbleText: 'b'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can we use sprite properties to change their appearance on the screen?The class extends its understanding of sprites by interacting with sprite properties.  The lesson starts with a review of what a sprite is, then moves on to Game Lab for more practice with sprites, using their properties to change their appearance.  The class then reflects on the connections between properties and variables.',
        description_teacher:
          'Question of the Day: How can we use sprite properties to change their appearance on the screen?Students extend their understanding of sprites by interacting with sprite properties.  Students start with a review of what a sprite is, then move on to Game Lab to practice more with sprites, using their properties to change their appearance.  They then reflect on the connections between properties and variables.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/8',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/8/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/8/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1563,
        position: 9,
        relative_position: 9,
        name: 'Text',
        key: 'Text',
        assessment: false,
        title: 'Lesson 9: Text',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3266',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '4447',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2344',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4448',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21594',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/5',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2338',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/5/sublevel/1',
                name: 'CSD U3 Sprites text debug_2018_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4396',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/5/sublevel/2',
                name: 'CSD games text debug quotes',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '4446',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/6',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21593',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/7',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '4449',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/7/sublevel/1',
                name: 'CSD web text stroke',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4425',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/7/sublevel/2',
                name: 'CSD web challenge stroke',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '4426',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/7/sublevel/3',
                name: 'CSD web challenge wrap text',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '4397',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/puzzle/7/sublevel/4',
                name: 'CSD games text freeplay',
                icon: null,
                bubbleText: 'd'
              }
            ]
          }
        ],
        description_student:
          "Question of the Day: How can we use text to improve our scenes and animations?This lesson introduces Game Lab's text commands, giving the class more practice using the coordinate plane and parameters.  At the beginning of the lesson, the class is asked to caption a cartoon created in Game Lab.  They then move onto Code Studio where they practice placing text on the screen and controlling other text properties, such as size.",
        description_teacher:
          "Question of the Day: How can we use text to improve our scenes and animations?This lesson introduces Game Lab's text commands, giving students more practice using the coordinate plane and parameters.  At the beginning of the lesson, students are asked to caption a cartoon created in Game Lab.  They then move onto Code Studio where they practice placing text on the screen and controlling other text properties, such as size.  Students who complete the assessment early may go on to learn more challenging blocks related to text properties. ",
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/9',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/9/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/9/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1564,
        position: 10,
        relative_position: 10,
        name: 'Mini-Project: Captioned Scenes',
        key: 'Mini-Project: Captioned Scenes',
        assessment: false,
        title: 'Lesson 10: Mini-Project: Captioned Scenes',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3269',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2198',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/puzzle/2',
            progression: 'Sprite Scenes',
            progressionDisplayName: 'Sprite Scenes',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2306',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/puzzle/3',
            progression: 'Create a Background',
            progressionDisplayName: 'Create a Background',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2312',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/puzzle/4',
            progression: 'Add Sprites',
            progressionDisplayName: 'Add Sprites',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2324',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/puzzle/5',
            progression: 'Add Text',
            progressionDisplayName: 'Add Text',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2300',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/puzzle/6',
            progression: 'Review Your Scene',
            progressionDisplayName: 'Review Your Scene',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          'Question of the Day: How can we use Game Lab to express our creativity?After a quick review of the code learned so far, the class is introduced to the first creative project of the unit.  Using the problem solving process as a model, students define the scene that they want to create, prepare by thinking of the different code they will need, try their plan in Game Lab, then reflect on what they have created.  In the end, they also have a chance to share their creations with their peers.',
        description_teacher:
          'Question of the Day: How can we use Game Lab to express our creativity?After a quick review of the code they have learned so far, students are introduced to their first creative project of the unit.  Using the problem solving process as a model, students define the scene that they want to create, prepare by thinking of the different code they will need, try their plan in Game Lab, then reflect on what they have created.  In the end, they also have a chance to share their creations with their peers.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/10',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/10/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/10/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1565,
        position: 11,
        relative_position: 11,
        name: 'The Draw Loop',
        key: 'The Draw Loop',
        assessment: false,
        title: 'Lesson 11: The Draw Loop',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3271',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '4496',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/2',
            progression: 'Video: Introduction to the Draw Loop',
            progressionDisplayName: 'Video: Introduction to the Draw Loop',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1713',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/3',
            progression: 'Exploration',
            progressionDisplayName: 'Exploration',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1706',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1725',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/5',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2896',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1743',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/7',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21580',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/8',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1737',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/8/sublevel/1',
                name: 'CSD U3 Draw Loop Plugged wiggle sprite rotation_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4382',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/8/sublevel/2',
                name: 'CSD games draw debug blurry',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '4381',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/8/sublevel/3',
                name: 'CSD games draw debug afterimage',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '4383',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/8/sublevel/4',
                name: 'CSD games draw debug not moving',
                icon: null,
                bubbleText: 'd'
              }
            ]
          },
          {
            id: '1749',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/9',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21579',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/10',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1731',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/10/sublevel/1',
                name: 'CSD U3 Draw Loop Plugged update your scene_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2038',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/puzzle/10/sublevel/2',
                name: 'CSD U3 L7 Freeplay_2020',
                icon: null,
                bubbleText: 'b'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can we animate our images in Game Lab?This lesson introduces the draw loop, one of the core programming paradigms in Game Lab.  The class combines the draw loop with random numbers to manipulate some simple animations with dots and then with sprites. ',
        description_teacher:
          'Question of the Day: How can we animate our images in Game Lab?In this lesson students are introduced to the draw loop, one of the core programming paradigms in Game Lab. To begin the lesson students look at some physical flipbooks to see that having many frames with different images creates the impression of motion. Students then watch a video explaining how the draw loop in Game Lab helps to create this same impression in their programs. Students combine the draw loop with random numbers to manipulate some simple animations with dots and then with sprites.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/11',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/11/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/11/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1566,
        position: 12,
        relative_position: 12,
        name: 'Sprite Movement',
        key: 'Sprite Movement',
        assessment: false,
        title: 'Lesson 12: Sprite Movement',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3284',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1413',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4461',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/3',
            progression: 'Video: Sprite Movement',
            progressionDisplayName: 'Video: Sprite Movement',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2220',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2208',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1683',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2214',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/7',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21592',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/8',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2491',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/8/sublevel/1',
                name: 'CSD U3 Watcher Predict_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2479',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/8/sublevel/2',
                name: 'CSD U3 Watcher Debug_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2081',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/8/sublevel/3',
                name: 'CSD U3 Movement Gears_2020',
                icon: null,
                bubbleText: 'c'
              }
            ]
          },
          {
            id: '2074',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/9',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21591',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/10',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2068',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/10/sublevel/1',
                name: 'CSD U3 Movement Fish challenge_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2065',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/10/sublevel/2',
                name: 'CSD U3 Movement Fish challenge2_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2044',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/puzzle/10/sublevel/3',
                name: 'CSD U3 L9 Freeplay_2020',
                icon: null,
                bubbleText: 'c'
              }
            ]
          }
        ],
        description_student:
          "Question of the Day: How can we control sprite movement in Game Lab?In this lesson, the class learns how to control sprite movement using a construct called the counter pattern, which incrementally changes a sprite's properties.  After brainstorming different ways that they could animate sprites by controlling their properties, the class explores the counter pattern in Code Studio, using the counter pattern to create various types of sprite movements.",
        description_teacher:
          "Question of the Day: How can we control sprite movement in Game Lab?In this lesson, students learn how to control sprite movement using a construct called the counter pattern, which incrementally changes a sprite's properties.  Students first brainstorm different ways that they could animate sprites by controlling their properties, then explore the counter pattern in Code Studio.  After examining working code, students try using the counter pattern to create various types of sprite movements.",
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/12',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/12/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/12/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1567,
        position: 13,
        relative_position: 13,
        name: 'Mini-Project: Animation',
        key: 'Mini-Project: Animation',
        assessment: false,
        title: 'Lesson 13: Mini-Project: Animation',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3289',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '4437',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/2',
            progression: 'Example Animated Scene',
            progressionDisplayName: 'Example Animated Scene',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4439',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/3',
            progression: 'Plan Your Scene',
            progressionDisplayName: 'Plan Your Scene',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4436',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/4',
            progression: 'Draw a Background',
            progressionDisplayName: 'Draw a Background',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4441',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/5',
            progression: 'Add Sprites',
            progressionDisplayName: 'Add Sprites',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4443',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/6',
            progression: 'Add Text',
            progressionDisplayName: 'Add Text',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4438',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/7',
            progression: 'Add Movement',
            progressionDisplayName: 'Add Movement',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4440',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/puzzle/8',
            progression: 'Review Your Animated Scene',
            progressionDisplayName: 'Review Your Animated Scene',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          'Question of the Day: How can we combine different programming patterns to make a complete animation?In this lesson, the class is asked to combine different methods from previous lessons to create an animated scene.  They first review the types of movement and animation that they have learned, and brainstorm what types of scenes might need that movement.  They then begin to plan out their own animated scenes, which they create in Game Lab.',
        description_teacher:
          'Question of the Day: How can we combine different programming patterns to make a complete animation?In this lesson, students are asked to combine different methods that they have learned to create an animated scene.  Students first review the types of movement and animation that they have learned, and brainstorm what types of scenes might need that movement.  They then begin to plan out their own animated scenes, which they create in Game Lab.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/13',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/13/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/13/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1568,
        position: 14,
        relative_position: 14,
        name: 'Conditionals',
        key: 'Conditionals',
        assessment: false,
        title: 'Lesson 14: Conditionals',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3294',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1621',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1401',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/3',
            progression: 'Video: Booleans',
            progressionDisplayName: 'Video: Booleans',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '18416',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/4',
            progression: 'Quick Check',
            progressionDisplayName: 'Quick Check',
            kind: 'puzzle',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1463',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1456',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '14070',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/7',
            progression: 'Video: Conditional Statements',
            progressionDisplayName: 'Video: Conditional Statements',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1649',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/8',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21578',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/9',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1615',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/9/sublevel/1',
                name: 'CSD U3 Boolean Modify_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4379',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/9/sublevel/2',
                name: 'CSD games conditionals bowl',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '4380',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/9/sublevel/3',
                name: 'CSD games conditionals practice spaceship',
                icon: null,
                bubbleText: 'c'
              }
            ]
          },
          {
            id: '4431',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/10',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21577',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/11',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1450',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/11/sublevel/1',
                name: 'CSD U3 - conditionals - first conditional 2_2018_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '1970',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/puzzle/11/sublevel/2',
                name: 'CSD U3 L11 Freeplay_2020',
                icon: null,
                bubbleText: 'b'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day:  How can programs react to changes as they are running?This lesson introduces booleans and conditionals, which allow a program to run differently depending on whether a condition is true.  The class starts by playing a short game in which they respond according to whether particular conditions are met.  They then move to Code Studio where they learn how the computer evaluates Boolean expressions, and how they can be used to structure a program.',
        description_teacher:
          'Question of the Day:  How can programs react to changes as they are running?This lesson introduces booleans and conditionals, which allow a program to run differently depending on whether a condition is true.  Students start by playing a short game in which they respond according to whether particular conditions are met.  They then move to Code Studio where they learn how the computer evaluates Boolean expressions, and how they can be used to structure a program.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/14',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/14/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/14/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1569,
        position: 15,
        relative_position: 15,
        name: 'Keyboard Input',
        key: 'Keyboard Input',
        assessment: false,
        title: 'Lesson 15: Keyboard Input',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3299',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1952',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3027',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2370',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1888',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21588',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/6',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1882',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/6/sublevel/1',
                name: 'CSD U3 Input Fish_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4386',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/6/sublevel/2',
                name: 'CSD games input debug1',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '4387',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/6/sublevel/3',
                name: 'CSD games input debug2',
                icon: null,
                bubbleText: 'c'
              }
            ]
          },
          {
            id: '1697',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/7',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21587',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/8',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1429',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/8/sublevel/1',
                name: 'CSD U3 - complex - key up and down_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '1690',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/8/sublevel/2',
                name: 'CSD U3 Direction Animations_2018_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '1976',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/puzzle/8/sublevel/3',
                name: 'CSD U3 L12 Freeplay_2020',
                icon: null,
                bubbleText: 'c'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can our programs react to user input?Following the introduction to booleans and if statements in the previous lesson, the class is introduced to a new block called <code>keyDown()</code> which returns a boolean and can be used in conditionals statements to move sprites around the screen. By the end of this lesson the class will have written programs that take keyboard input from the user to control sprites on the screen.',
        description_teacher:
          'Question of the Day: How can our programs react to user input?Following the introduction to booleans and if statements in the previous lesson, students are introduced to a new block called <code>keyDown()</code> which returns a boolean and can be used in conditionals statements to move sprites around the screen. By the end of this lesson students will have written programs that take keyboard input from the user to control sprites on the screen.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/15',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/15/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/15/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1570,
        position: 16,
        relative_position: 16,
        name: 'Mouse Input',
        key: 'Mouse Input',
        assessment: false,
        title: 'Lesson 16: Mouse Input',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3304',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '3010',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1407',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/3',
            progression: 'Video: If/Else Statements',
            progressionDisplayName: 'Video: If/Else Statements',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1761',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4390',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1435',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1876',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/7',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21590',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/8',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '4388',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/8/sublevel/1',
                name: 'CSD games mouse mousey',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4391',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/8/sublevel/2',
                name: 'CSD games practice move with mouse',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '4435',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/9',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21589',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/10',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '4389',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/10/sublevel/1',
                name: 'CSD games mouse scale',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2050',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/10/sublevel/2',
                name: 'CSD U3 Mouse Input Bee 1_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2056',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/10/sublevel/3',
                name: 'CSD U3 Mouse Input Bee 2_2020',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '1441',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/10/sublevel/4',
                name: 'CSD U3 - complex - mouse move_2020',
                icon: null,
                bubbleText: 'd'
              },
              {
                id: '1982',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/puzzle/10/sublevel/5',
                name: 'CSD U3 L13 Freeplay_2020',
                icon: null,
                bubbleText: 'e'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: What are more ways that the computer can react to user input?The class continues to explore ways to use conditional statements to take user input. In addition to the keyboard commands learned yesterday, they will learn about several ways to take mouse input.  They will also expand their understanding of conditional to include <code>else</code>, which allows for the computer to run a certain section of code when a condition is true, and a different section of code when it is not.',
        description_teacher:
          'Question of the Day: What are more ways that the computer can react to user input?In this lesson students continue to explore ways to use conditional statements to take user input. In addition to the keyboard commands learned yesterday, students will learn about several ways to take mouse input.  They will also expand their understanding of conditionals to include <code>else</code>, which allows for the computer to run a certain section of code when a condition is true, and a different section of code when it is not.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/16',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/16/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/16/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1571,
        position: 17,
        relative_position: 17,
        name: 'Project - Interactive Card',
        key: 'Project - Interactive Card',
        assessment: false,
        title: 'Lesson 17: Project - Interactive Card',
        lesson_group_display_name: 'Chapter 1: Images and Animations',
        lockable: false,
        levels: [
          {
            id: '3309',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1900',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/2',
            progression: 'interactive Card',
            progressionDisplayName: 'interactive Card',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '15983',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/3',
            progression: 'Make an Interactive Card',
            progressionDisplayName: 'Make an Interactive Card',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1894',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/4',
            progression: 'Project Work',
            progressionDisplayName: 'Project Work',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1918',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/5',
            progression: 'Project Work',
            progressionDisplayName: 'Project Work',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1930',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/6',
            progression: 'Project Work',
            progressionDisplayName: 'Project Work',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1912',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/7',
            progression: 'Project Work',
            progressionDisplayName: 'Project Work',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1906',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/8',
            progression: 'Project Work',
            progressionDisplayName: 'Project Work',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21650',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/puzzle/9/page/1',
            progression: 'Reflection',
            progressionDisplayName: 'Reflection',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          "Question of the Day:  What skills and practices are important when creating an interactive program?In this cumulative project for Chapter 1, the class plans for and develops an interactive greeting card using all of the programming techniques they've learned to this point.",
        description_teacher:
          "Question of the Day:  What skills and practices are important when creating an interactive program?In this cumulative project for Chapter 1, students plan for and develop an interactive greeting card using all of the programming techniques they've learned to this point.",
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/17',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/17/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/17/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1572,
        position: 18,
        relative_position: 18,
        name: 'Velocity',
        key: 'Velocity',
        assessment: false,
        title: 'Lesson 18: Velocity',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3314',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2673',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/2',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4504',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/3',
            progression: 'Video: Velocity',
            progressionDisplayName: 'Video: Velocity',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2686',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2620',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2614',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2666',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/7',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4401',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/8',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21545',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/9',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2680',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/9/sublevel/1',
                name: 'CSD U3 abstraction velocityY control_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '4399',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/9/sublevel/2',
                name: 'CSD games velocity bee',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '2654',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/10',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21544',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/11',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '4398',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/11/sublevel/1',
                name: 'CSD games velocity 4 directions',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '1988',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/puzzle/11/sublevel/2',
                name: 'CSD U3 L15 Freeplay_2020',
                icon: null,
                bubbleText: 'b'
              }
            ]
          }
        ],
        description_student:
          "Question of the Day:  How can programming languages hide complicated patterns so that it is easier to program?After a brief review of how the counter pattern is used to move sprites, the class is introduced to the idea of hiding those patterns in a single block, in order to help manage the complexity of programs.  They then head to Code Studio to try out new blocks that set a sprite's velocity directly, and look at various ways that they are able to code more complex behaviors in their sprites.  ",
        description_teacher:
          "Question of the Day:  How can programming languages hide complicated patterns so that it is easier to program?After a brief review of how they used the counter pattern to move sprites in previous lessons, students are introduced to the idea of hiding those patterns in a single block.  Students then head to Code Studio to try out new blocks that set a sprite's velocity directly, and look at various ways that they are able to code more complex behaviors in their sprites.  ",
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/18',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/18/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/18/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1573,
        position: 19,
        relative_position: 19,
        name: 'Collision Detection',
        key: 'Collision Detection',
        assessment: false,
        title: 'Lesson 19: Collision Detection',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3319',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2740',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/2',
            progression: 'Sample Game',
            progressionDisplayName: 'Sample Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2733',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2834',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2791',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2748',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21509',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/7',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2717',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/7/sublevel/1',
                name: 'CSD U3 collision detection practice debugistouching',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2713',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/7/sublevel/2',
                name: 'CSD U3 collision detection challenge collider circle',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '2828',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/8',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21508',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/9',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2712',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/9/sublevel/1',
                name: 'CSD U3 collision detection challenge collider angle',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2718',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/9/sublevel/2',
                name: 'CSD U3 collision detection practice debugpoints',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '1994',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/puzzle/9/sublevel/3',
                name: 'CSD U3 L16 Freeplay_2020',
                icon: null,
                bubbleText: 'c'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can programming help make complicated problems more simple?The class learns about collision detection on the computer.  Working in pairs, they explore how a computer could use sprite location and size properties and math to detect whether two sprites are touching.  They then use the <code>isTouching()</code> block to create different effects when sprites collide and practice using the block to model various interactions.',
        description_teacher:
          'Question of the Day: How can programming help make complicated problems more simple?Students learn about collision detection on the computer.  Working in pairs, they explore how a computer could use sprite location and size properties and math to detect whether two sprites are touching.  They then use the <code>isTouching()</code> block to create different effects when sprites collide and practice using the block to model various interactions.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/19',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/19/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/19/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1574,
        position: 20,
        relative_position: 20,
        name: 'Mini-Project: Side Scroller',
        key: 'Mini-Project: Side Scroller',
        assessment: false,
        title: 'Lesson 20: Mini-Project: Side Scroller',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3322',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '4393',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/2',
            progression: 'Intro to Side Scrollers',
            progressionDisplayName: 'Intro to Side Scrollers',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4394',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/3',
            progression: 'Draw Your Background',
            progressionDisplayName: 'Draw Your Background',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2648',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/4',
            progression: 'Create Your Sprites',
            progressionDisplayName: 'Create Your Sprites',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2560',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/5',
            progression: 'Player Controls',
            progressionDisplayName: 'Player Controls',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2593',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/6',
            progression: 'Looping',
            progressionDisplayName: 'Looping',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2867',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/7',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2855',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/8',
            progression: 'Scoring & Scoreboard',
            progressionDisplayName: 'Scoring & Scoreboard',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4395',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/puzzle/9',
            progression: 'Review Your Game',
            progressionDisplayName: 'Review Your Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          'Question of the Day:  How can the new types of sprite movement and collision detection be used to create a game?The class uses what it has learned about collision detection and setting velocity to create simple side scroller games.  After looking at a sample side scroller game, students brainstorm what sort of side scroller they would like, then use a structured process to program the game in Code Studio.',
        description_teacher:
          'Question of the Day:  How can the new types of sprite movement and collision detection be used to create a game?Students use what they have learned about collision detection and setting velocity to create a simple side scroller game.  After looking at a sample side scroller game, students brainstorm what sort of side scroller they would like, then use a structured process to program the game in Code Studio.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/20',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/20/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/20/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1575,
        position: 21,
        relative_position: 21,
        name: 'Complex Sprite Movement',
        key: 'Complex Sprite Movement',
        assessment: false,
        title: 'Lesson 21: Complex Sprite Movement',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3325',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1627',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/2',
            progression: 'Prediction',
            progressionDisplayName: 'Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2502',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2514',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2538',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21511',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/6',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2508',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/6/sublevel/1',
                name: 'CSD U3 abstraction accelerateY up_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '22354',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/6/sublevel/2',
                name: 'CSD U3 practice deceleration',
                icon: null,
                bubbleText: 'b'
              }
            ]
          },
          {
            id: '2544',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/7',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21510',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/8',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2891',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/8/sublevel/1',
                name: 'CSD U3 complex sprite movement practice parabola',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2890',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/8/sublevel/2',
                name: 'CSD U3 complex sprite movement practice deceleration',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2000',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/puzzle/8/sublevel/3',
                name: 'CSD U3 L17 Freeplay_2020',
                icon: null,
                bubbleText: 'c'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can previous blocks be combined in new patterns to make interesting movements?The class learns to combine the velocity properties of sprites with the counter pattern to create more complex sprite movement. After reviewing the two concepts, they explore various scenarios in which velocity is used in the counter pattern, and observe the different types of movement that result.  In particular, the class learns how to simulate gravity.  They then reflect on how they were able to get new behaviors by combining blocks and patterns that they already knew.',
        description_teacher:
          'Question of the Day: How can previous blocks be combined in new patterns to make interesting movements?Students learn to combine the velocity properties of sprites with the counter pattern to create more complex sprite movement. After reviewing the two concepts, they explore various scenarios in which velocity is used in the counter pattern, and observe the different types of movement that result.  In particular, students learn how to simulate gravity.  They then reflect on how they were able to get new behaviors by combining blocks and patterns that they already knew.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/21',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/21/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/21/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1576,
        position: 22,
        relative_position: 22,
        name: 'Collisions',
        key: 'Collisions',
        assessment: false,
        title: 'Lesson 22: Collisions',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3330',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2848',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/2',
            progression: 'Code Prediction',
            progressionDisplayName: 'Code Prediction',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2767',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2773',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2761',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/5',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2875',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/6',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21505',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/7',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2887',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/7/sublevel/1',
                name: 'CSD U3 collisions types_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '22295',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/7/sublevel/2',
                name: 'CSD U3 collisions types2_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '22297',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/7/sublevel/3',
                name: 'CSD U3 collisions types3_2020',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '22299',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/7/sublevel/4',
                name: 'CSD U3 collisions types4_2020',
                icon: null,
                bubbleText: 'd'
              }
            ]
          },
          {
            id: '4378',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/8',
            progression: 'Assessment',
            progressionDisplayName: 'Assessment',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21504',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/9',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '2754',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/9/sublevel/1',
                name: 'CSD U3 collisions debug_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2861',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/9/sublevel/2',
                name: 'CSD U3 collisions setCollider_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '2727',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/9/sublevel/3',
                name: 'CSD U3 collisions bounciness_2020',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '2006',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/puzzle/9/sublevel/4',
                name: 'CSD U3 L18 Freeplay_2020',
                icon: null,
                bubbleText: 'd'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can programmers build on abstractions to create further abstractions?In this lesson, the class programs their sprites to interact in new ways.  After a brief review of how they used the <code>isTouching</code> block, students brainstorm other ways that two sprites could interact.  They then use <code>isTouching</code> to make one sprite push another across the screen before practicing with the four collision blocks (<code>collide</code>, <code>displace</code>, <code>bounce</code>, and <code>bounceOff</code>).',
        description_teacher:
          'Question of the Day: How can programmers build on abstractions to create further abstractions?In this lessson, students program their sprites to interact in new ways.  After a brief review of how they used the <code>isTouching</code> block, students brainstorm other ways that two sprites could interact.  They then use <code>isTouching</code> to make one sprite push another across the screen before practicing with the four collision blocks (<code>collide</code>, <code>displace</code>, <code>bounce</code>, and <code>bounceOff</code>).',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/22',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/22/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/22/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1577,
        position: 23,
        relative_position: 23,
        name: 'Mini-Project: Flyer Game',
        key: 'Mini-Project: Flyer Game',
        assessment: false,
        title: 'Lesson 23: Mini-Project: Flyer Game',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3338',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '4384',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/2',
            progression: 'Intro to Flyer Game',
            progressionDisplayName: 'Intro to Flyer Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2520',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/3',
            progression: 'Make Your Sprites',
            progressionDisplayName: 'Make Your Sprites',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2575',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/4',
            progression: 'Player Controls',
            progressionDisplayName: 'Player Controls',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2587',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/5',
            progression: 'Player Controls',
            progressionDisplayName: 'Player Controls',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2581',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/6',
            progression: 'Player Controls',
            progressionDisplayName: 'Player Controls',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2797',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/7',
            progression: 'Sprite Movement',
            progressionDisplayName: 'Sprite Movement',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2607',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/8',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2803',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/puzzle/9',
            progression: 'Review Your Game',
            progressionDisplayName: 'Review Your Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          'Question of the Day:  How can the new types collisions and modeling movement be used to create a game?The class uses what it has learned about simulating gravity and the different types of collisions  to create simple flyer games.  After looking at a sample flyer game, students brainstorm what sort of flyer they would like, then use a structured process to program the game in Code Studio.',
        description_teacher:
          'Question of the Day:  How can the new types of collisions and modeling movement be used to create a game?Students use what they have learned about simulating gravity and the different types of collisions to create simple flyer games.  After looking at a sample flyer game, students brainstorm what sort of flyer games they would like, then use a structured process to program the game in Code Studio.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/23',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/23/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/23/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1578,
        position: 24,
        relative_position: 24,
        name: 'Functions',
        key: 'Functions',
        assessment: false,
        title: 'Lesson 24: Functions',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3335',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '2933',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/2',
            progression: 'Video: Functions',
            progressionDisplayName: 'Video: Functions',
            kind: 'puzzle',
            icon: 'fa-video-camera',
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1812',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/3',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1825',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/4',
            progression: 'Skill Building',
            progressionDisplayName: 'Skill Building',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1832',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/5',
            progression: 'Predict',
            progressionDisplayName: 'Predict',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21507',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/6',
            progression: 'Practice',
            progressionDisplayName: 'Practice',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1806',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/6/sublevel/1',
                name: 'CSD U3 Functions Call Draw Loop_2020',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '1844',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/6/sublevel/2',
                name: 'CSD U3 Functions Reset Sprite_2020',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '1838',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/6/sublevel/3',
                name: 'CSD U3 Functions Randomize Sprite_2020',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '1818',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/6/sublevel/4',
                name: 'CSD U3 Functions Create Function_2020',
                icon: null,
                bubbleText: 'd'
              }
            ]
          },
          {
            id: '4385',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/7',
            progression: 'Quick Check',
            progressionDisplayName: 'Quick Check',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1856',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/8',
            progression: 'Collector Game',
            progressionDisplayName: 'Collector Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1800',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/9',
            progression: 'Collector Game',
            progressionDisplayName: 'Collector Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1794',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/10',
            progression: 'Collector Game',
            progressionDisplayName: 'Collector Game',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21506',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/11',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1866',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/11/sublevel/1',
                name: 'CSD U3 Functions challenge drawscene',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '2012',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/puzzle/11/sublevel/2',
                name: 'CSD U3 L19 Freeplay_2020',
                icon: null,
                bubbleText: 'b'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day: How can programmers use functions to create their own abstractions?This lesson covers functions as a way to organize their code, make it more readable, and remove repeated blocks of code. The class learns that higher level or more abstract steps make it easier to understand and reason about steps, then begins to create functions in Game Lab. ',
        description_teacher:
          'Question of the Day: How can programmers use functions to create their own abstractions?Students learn how to create functions to organize their code, make it more readable, and remove repeated blocks of code. Students first think about what sorts of new blocks they would like in Game Lab, and what code those blocks would contain inside. Afterwards students learn to create functions in Game Lab. They will use functions to remove long blocks of code from their draw loop and to replace repeated pieces of code with a single function.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/24',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/24/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/24/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1579,
        position: 25,
        relative_position: 25,
        name: 'The Game Design Process',
        key: 'The Game Design Process',
        assessment: false,
        title: 'Lesson 25: The Game Design Process',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3339',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1503',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/2',
            progression: 'Same Game',
            progressionDisplayName: 'Same Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '15976',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/3',
            progression: 'Plan Your Project',
            progressionDisplayName: 'Plan Your Project',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '1510',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/4',
            progression: 'Set Up Sprites',
            progressionDisplayName: 'Set Up Sprites',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1537',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/5',
            progression: 'Set Up Sprites',
            progressionDisplayName: 'Set Up Sprites',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1561',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/6',
            progression: 'Control Your Player',
            progressionDisplayName: 'Control Your Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1567',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/7',
            progression: 'Control Your Player',
            progressionDisplayName: 'Control Your Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1516',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/8',
            progression: 'Control Your Player',
            progressionDisplayName: 'Control Your Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1549',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/9',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1543',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/10',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1524',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/11',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1530',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/12',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 12,
            bubbleText: '12',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '1580',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/13',
            progression: 'Sprite Interactions',
            progressionDisplayName: 'Sprite Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 13,
            bubbleText: '13',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21503',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/14',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 14,
            bubbleText: '14',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '1519',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/14/sublevel/1',
                name: 'CSD U3 AnimationsMulti defender background',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '1570',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/14/sublevel/2',
                name: 'CSD U3 AnimationsMulti defender randomizespeed',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '1520',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/14/sublevel/3',
                name: 'CSD U3 AnimationsMulti defender changevisuals',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '1533',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/puzzle/14/sublevel/4',
                name: 'CSD U3 AnimationsMulti defender endgame',
                icon: null,
                bubbleText: 'd'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day:  How does having a plan help to make a large project easier?This lesson introduces the process the class will use to design games for the remainder of the unit. This process is centered around a project guide which asks students to define their sprites, variables, and functions before they begin programming their game. The class walks through this process in a series of levels.   At the end of the lesson they have an opportunity to make improvements to the game to make it their own.',
        description_teacher:
          'Question of the Day:  How does having a plan help to make a large project easier?This lesson introduces students to the process they will use to design games for the remainder of the unit. This process is centered around a project guide which asks students to define their sprites, variables, and functions before they begin programming their game. In this lesson students begin by playing a game on Game Lab where the code is hidden. They discuss what they think the sprites, variables, and functions would need to be to make the game. They are then given a completed project guide which shows one way to implement the game. Students are then walked through this process through a series of levels.  At the end of the lesson students have an opportunity to make improvements to the game to make it their own.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/25',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/25/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/25/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1580,
        position: 26,
        relative_position: 26,
        name: 'Using the Game Design Process',
        key: 'Using the Game Design Process',
        assessment: false,
        title: 'Lesson 26: Using the Game Design Process',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3342',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '3144',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/2',
            progression: 'Sample Platform Jumper Game',
            progressionDisplayName: 'Sample Platform Jumper Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '16061',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/3',
            progression: 'Build a Platform Jumper',
            progressionDisplayName: 'Build a Platform Jumper',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '3052',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/4',
            progression: 'Platform Jumper - Background and Variables',
            progressionDisplayName:
              'Platform Jumper - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3176',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/5',
            progression: 'Platform Jumper - Background and Variables',
            progressionDisplayName:
              'Platform Jumper - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3058',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/6',
            progression: 'Platform Jumper - Background and Variables',
            progressionDisplayName:
              'Platform Jumper - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3164',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/7',
            progression: 'Platform Jumper - Background and Variables',
            progressionDisplayName:
              'Platform Jumper - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3099',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/8',
            progression: 'Platform Jumper - Platforms',
            progressionDisplayName: 'Platform Jumper - Platforms',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3105',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/9',
            progression: 'Platform Jumper - Platforms',
            progressionDisplayName: 'Platform Jumper - Platforms',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3111',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/10',
            progression: 'Platform Jumper - Platforms',
            progressionDisplayName: 'Platform Jumper - Platforms',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3081',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/11',
            progression: 'Platform Jumper - Items',
            progressionDisplayName: 'Platform Jumper - Items',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3087',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/12',
            progression: 'Platform Jumper - Items',
            progressionDisplayName: 'Platform Jumper - Items',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 12,
            bubbleText: '12',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3093',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/13',
            progression: 'Platform Jumper - Items',
            progressionDisplayName: 'Platform Jumper - Items',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 13,
            bubbleText: '13',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3117',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/14',
            progression: 'Platform Jumper - Player',
            progressionDisplayName: 'Platform Jumper - Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 14,
            bubbleText: '14',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3123',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/15',
            progression: 'Platform Jumper - Player',
            progressionDisplayName: 'Platform Jumper - Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 15,
            bubbleText: '15',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3130',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/16',
            progression: 'Platform Jumper - Player',
            progressionDisplayName: 'Platform Jumper - Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 16,
            bubbleText: '16',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3136',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/17',
            progression: 'Platform Jumper - Player',
            progressionDisplayName: 'Platform Jumper - Player',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 17,
            bubbleText: '17',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3139',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/18',
            progression: 'Platform Jumper Review',
            progressionDisplayName: 'Platform Jumper Review',
            kind: 'assessment',
            icon: null,
            isUnplugged: false,
            levelNumber: 18,
            bubbleText: '18',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3151',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/19',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 19,
            bubbleText: '19',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '3158',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/20',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 20,
            bubbleText: '20',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21518',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/21',
            progression: 'Challenges',
            progressionDisplayName: 'Challenges',
            kind: 'puzzle',
            icon: 'fa fa-sitemap',
            isUnplugged: false,
            levelNumber: 21,
            bubbleText: '21',
            isConceptLevel: false,
            bonus: null,
            sublevels: [
              {
                id: '3061',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/21/sublevel/1',
                name: 'CSD U3 platform challenge animationfacing',
                icon: null,
                bubbleText: 'a'
              },
              {
                id: '3067',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/21/sublevel/2',
                name: 'CSD U3 platform challenge lives',
                icon: null,
                bubbleText: 'b'
              },
              {
                id: '3064',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/21/sublevel/3',
                name: 'CSD U3 platform challenge differentitem',
                icon: null,
                bubbleText: 'c'
              },
              {
                id: '3068',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/21/sublevel/4',
                name: 'CSD U3 platform challenge sidewalls',
                icon: null,
                bubbleText: 'd'
              },
              {
                id: '3062',
                url:
                  'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/puzzle/21/sublevel/5',
                name: 'CSD U3 platform challenge animations',
                icon: null,
                bubbleText: 'e'
              }
            ]
          }
        ],
        description_student:
          'Question of the Day:  How can the problem solving process help programmers to manage large projects?In this multi-day lesson, the class uses the problem solving process from Unit 1 to create a platform jumper game.  After looking at a sample game, the class defines what their games will look like and uses a structured process to build them.  Finally, the class reflects on how the games could be improved, and implements those changes.',
        description_teacher:
          'Question of the Day:  How can the problem solving process help programmers to manage large projects?In this multi-day lesson, students use the problem solving process from Unit 1 to create a platform jumper game.  They start by looking at an example of a platform jumper, then define what their games will look like.  Next, they use a structured process to plan the backgrounds, variables, sprites, and functions they will need to implement their game.  After writing the code for the game, students will reflect on how the game could be improved, and implement those changes.',
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/26',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/26/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/26/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1581,
        position: 27,
        relative_position: 27,
        name: 'Project - Design a Game',
        key: 'Project - Design a Game',
        assessment: false,
        title: 'Lesson 27: Project - Design a Game',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: false,
        levels: [
          {
            id: '3345',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/1',
            progression: 'Lesson Overview',
            progressionDisplayName: 'Lesson Overview',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '16021',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/2',
            progression: 'Design Your Game',
            progressionDisplayName: 'Design Your Game',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '3000',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/3',
            progression: 'Project - Background and Variables',
            progressionDisplayName: 'Project - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2952',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/4',
            progression: 'Project - Background and Variables',
            progressionDisplayName: 'Project - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2970',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/5',
            progression: 'Project - Background and Variables',
            progressionDisplayName: 'Project - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2958',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/6',
            progression: 'Project - Background and Variables',
            progressionDisplayName: 'Project - Background and Variables',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 6,
            bubbleText: '6',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2946',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/7',
            progression: 'Project - Sprites and Interactions',
            progressionDisplayName: 'Project - Sprites and Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 7,
            bubbleText: '7',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2964',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/8',
            progression: 'Project - Sprites and Interactions',
            progressionDisplayName: 'Project - Sprites and Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 8,
            bubbleText: '8',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2982',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/9',
            progression: 'Project - Sprites and Interactions',
            progressionDisplayName: 'Project - Sprites and Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 9,
            bubbleText: '9',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2994',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/10',
            progression: 'Project - Sprites and Interactions',
            progressionDisplayName: 'Project - Sprites and Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 10,
            bubbleText: '10',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '2976',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/11',
            progression: 'Project - Sprites and Interactions',
            progressionDisplayName: 'Project - Sprites and Interactions',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 11,
            bubbleText: '11',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '4392',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/12',
            progression: 'Review Your Game',
            progressionDisplayName: 'Review Your Game',
            kind: 'puzzle',
            icon: null,
            isUnplugged: false,
            levelNumber: 12,
            bubbleText: '12',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21657',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/puzzle/13/page/1',
            progression: 'Reflection',
            progressionDisplayName: 'Reflection',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 13,
            bubbleText: '13',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student:
          'Question of the Day: How can the five CS practices (problem solving, persistence, communication, collaboration, and creativity) help programmers to complete large projects?The class plans and builds original games using the project guide from the previous two lessons. Working individually or in pairs, the class plans, develops, and gives feedback on the games.  After incorporating the peer feedback, the class members share out their completed games.',
        description_teacher:
          "Question of the Day: How can the five CS practices (problem solving, persistence, communication, collaboration, and creativity) help programmers to complete large projects?Students will plan and build their own game using the project guide from the previous two lessons to guide their project. Working individually or in pairs, students will first decide on the type of game they'd like to build, taking as inspiration a set of sample games. They will then complete a blank project guide where they will describe the game's behavior and scope out the variables, sprites, and functions they'll need to build. In Code Studio, a series of levels prompts them on a general sequence they can use to implement this plan. Partway through the process, students will share their projects for peer review and will incorporate feedback as they finish their game. At the end of the lesson, students will share their completed games with their classmates. This project will span multiple classes and can easily take anywhere from 3-5 class periods.",
        unplugged: false,
        lesson_plan_html_url: 'https://curriculum.code.org/csd-20/unit3/27',
        lesson_plan_pdf_url:
          '//localhost.code.org:3000/curriculum/csd3-2020/27/Teacher.pdf',
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/27/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1582,
        position: 28,
        relative_position: 1,
        name: 'Post-Project Test',
        key: 'Post-Project Test',
        assessment: false,
        title: 'Post-Project Test',
        lesson_group_display_name: 'Chapter 2: Building Games',
        lockable: true,
        levels: [
          {
            id: '21605',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/lockable/1/puzzle/1/page/1',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student: '',
        description_teacher: '',
        unplugged: false,
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/1/extras'
      },
      {
        script_id: 162,
        script_name: 'csd3-2020',
        num_script_lessons: 29,
        id: 1583,
        position: 29,
        relative_position: 2,
        name: 'CS Discoveries Post Course survey',
        key: 'CS Discoveries Post Course survey',
        assessment: false,
        title: 'CS Discoveries Post Course survey',
        lesson_group_display_name: 'Survey',
        lockable: true,
        levels: [
          {
            id: '15855',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/lockable/2/puzzle/1',
            kind: 'puzzle',
            icon: 'fa-file-text',
            isUnplugged: false,
            levelNumber: 1,
            bubbleText: '1',
            isConceptLevel: true,
            bonus: null
          },
          {
            id: '21614',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/lockable/2/puzzle/2/page/1',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 2,
            bubbleText: '2',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21614',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/lockable/2/puzzle/2/page/2',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 3,
            bubbleText: '3',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21614',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/lockable/2/puzzle/2/page/3',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 4,
            bubbleText: '4',
            isConceptLevel: false,
            bonus: null
          },
          {
            id: '21614',
            url:
              'http://localhost-studio.code.org:3000/s/csd3-2020/lockable/2/puzzle/2/page/4',
            kind: 'assessment',
            icon: 'fa fa-list-ul',
            isUnplugged: false,
            levelNumber: 5,
            bubbleText: '5',
            isConceptLevel: false,
            bonus: null
          }
        ],
        description_student: '',
        description_teacher: '',
        unplugged: false,
        lesson_extras_level_url:
          'http://localhost-studio.code.org:3000/s/csd3-2020/stage/2/extras'
      }
    ].slice(0, numLessons),
    family_name: null,
    version_year: null,
    name: 'csd3-2020'
  };
}
