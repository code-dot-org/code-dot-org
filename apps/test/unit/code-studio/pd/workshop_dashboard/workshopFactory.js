import {Factory} from 'rosie';

import {States} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * Factory for the workshop object passed around by workshop dashboard components,
 * as retrieved from /api/v1/pd/workshops/<workshop-id>
 * @see also `workshopShape` and `enrollmentShape` in types.js
 */

// For testing average middle of the year dates.
const middleOfYearFakeToday = new Date(2016, 6, 1); // July 1st, 2016
// For testing cases when wrapping around from December of one year to January of the next.
const endOfYearFakeToday = new Date(2016, 12, 30); // December 30th, 2016

/**
 * WORKSHOPS
 */
Factory.define('workshop')
  .sequence('id', n => n)
  .attr('course', 'CS Fundamentals')
  .attr('subject', 'Intro')
  .attr('sessions', () => Factory.buildList('session', 1))
  .attr('state', States[0])
  .attr('account_required_for_attendance?', false)
  .attr('scholarship_workshop?', false)
  .attr('created_at', () => middleOfYearFakeToday.toISOString())
  .attr('capacity', 10)
  .attr('facilitators', [])
  .attr('location_name', 'virtual')
  .attr('on_map', false)
  .attr('funded', true)
  .attr('enrolled_teacher_count', 1)
  .attr('organizer', {name: 'Oscar Organzier', email: 'oscar@code.org'})
  .attr('virtual', false);

Factory.define('workshop multiple sessions')
  .extend('workshop')
  .attr('sessions', () => Factory.buildList('session', 3));

Factory.define('virtual workshop').extend('workshop').attr('virtual', true);

Factory.define('csp summer workshop')
  .extend('workshop')
  .attr('course', 'CS Principles')
  .attr('subject', '5-day Summer')
  .attr('sessions', () => Factory.buildList('session', 5))
  .attr('account_required_for_attendance?', true)
  .attr('scholarship_workshop?', true)
  .attr('location_name', 'physical');

Factory.define('csp ayw workshop 1')
  .extend('workshop')
  .attr('course', 'CS Principles')
  .attr('subject', 'Academic Year Workshop 1')
  .attr('sessions', () => Factory.buildList('session', 5))
  .attr('account_required_for_attendance?', true)
  .attr('scholarship_workshop?', true)
  .attr('location_name', 'physical');

Factory.define('csp summer workshop starting within a month')
  .extend('csp summer workshop')
  .attr('sessions', () =>
    Factory.buildList(
      'session starting within month of middleOfYearFakeToday',
      2
    )
  );

Factory.define('csd summer workshop starting within a month')
  .extend('csp summer workshop starting within a month')
  .attr('course', 'CS Discoveries');

Factory.define('csp ayw1 workshop starting within a month')
  .extend('csp summer workshop starting within a month')
  .attr('subject', 'Academic Year Workshop 1');

Factory.define('csp summer workshop starting in over a month')
  .extend('csp summer workshop')
  .attr('sessions', () =>
    Factory.buildList(
      'session starting in over a month from middleOfYearFakeToday',
      1
    )
  );

Factory.define(
  'csp summer workshop starting within month of endOfYearFakeToday'
)
  .extend('csp summer workshop')
  .attr('sessions', () =>
    Factory.buildList('session starting within month of endOfYearFakeToday', 1)
  );

Factory.define(
  'csp summer workshop starting in over a month from endOfYearFakeToday'
)
  .extend('csp summer workshop')
  .attr('sessions', () =>
    Factory.buildList(
      'session starting in over a month from endOfYearFakeToday',
      1
    )
  );

/**
 * SESSIONS
 */
Factory.define('session')
  .sequence('id')
  .attr('code', 'TEST')
  .attr('start', middleOfYearFakeToday.toISOString())
  .attr('end', middleOfYearFakeToday.toISOString())
  .attr('attendance_count', 0)
  .attr('show_link?', false);

Factory.define('session starting within month of middleOfYearFakeToday')
  .extend('session')
  .attr(
    'start',
    new Date(
      middleOfYearFakeToday.getFullYear(),
      middleOfYearFakeToday.getMonth(),
      middleOfYearFakeToday.getDate() + 15
    ).toISOString()
  )
  .attr(
    'end',
    new Date(
      middleOfYearFakeToday.getFullYear(),
      middleOfYearFakeToday.getMonth(),
      middleOfYearFakeToday.getDate() + 16
    ).toISOString()
  );

Factory.define('session starting in over a month from middleOfYearFakeToday')
  .extend('session')
  .attr(
    'start',
    new Date(
      middleOfYearFakeToday.getFullYear(),
      middleOfYearFakeToday.getMonth(),
      middleOfYearFakeToday.getDate() + 32
    ).toISOString()
  )
  .attr(
    'end',
    new Date(
      middleOfYearFakeToday.getFullYear(),
      middleOfYearFakeToday.getMonth(),
      middleOfYearFakeToday.getDate() + 32
    ).toISOString()
  );

Factory.define('session starting within month of endOfYearFakeToday')
  .extend('session')
  .attr(
    'start',
    new Date(
      endOfYearFakeToday.getFullYear(),
      endOfYearFakeToday.getMonth(),
      endOfYearFakeToday.getDate() + 15
    ).toISOString()
  )
  .attr(
    'end',
    new Date(
      endOfYearFakeToday.getFullYear(),
      endOfYearFakeToday.getMonth(),
      endOfYearFakeToday.getDate() + 16
    ).toISOString()
  );

Factory.define('session starting in over a month from endOfYearFakeToday')
  .extend('session')
  .attr(
    'start',
    new Date(
      endOfYearFakeToday.getFullYear(),
      endOfYearFakeToday.getMonth(),
      endOfYearFakeToday.getDate() + 32
    ).toISOString()
  )
  .attr(
    'end',
    new Date(
      endOfYearFakeToday.getFullYear(),
      endOfYearFakeToday.getMonth(),
      endOfYearFakeToday.getDate() + 32
    ).toISOString()
  );

/**
 * ENROLLMENTS
 */
Factory.define('enrollment')
  .sequence('id')
  .attr('email', 'fake@example.com')
  .attr('first_name', 'George')
  .attr('last_name', 'Dragon')
  .attr('school', 'Academy')
  .attr('attended', false);
