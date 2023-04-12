import {Factory} from 'rosie';
import {States} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * Factory for the workshop object passed around by workshop dashboard components,
 * as retrieved from /api/v1/pd/workshops/<workshop-id>
 * @see also `workshopShape` and `enrollmentShape` in types.js
 */
const today = new Date();

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
  .attr('created_at', () => today.toISOString())
  .attr('capacity', 10)
  .attr('facilitators', [])
  .attr('location_name', 'virtual')
  .attr('on_map', false)
  .attr('funded', true)
  .attr('enrolled_teacher_count', 1)
  .attr('organizer', {name: 'Oscar Organzier', email: 'oscar@code.org'})
  .attr('virtual', false);

Factory.define('csp summer workshop')
  .extend('workshop')
  .attr('course', 'CS Principles')
  .attr('subject', '5-day Summer')
  .attr('sessions', () => Factory.buildList('session', 5))
  .attr('account_required_for_attendance?', true)
  .attr('scholarship_workshop?', true)
  .attr('location_name', 'physical');

Factory.define('csp summer workshop starting within month')
  .extend('csp summer workshop')
  .attr('sessions', () =>
    Factory.buildList('session starting within month', 2)
  );

Factory.define('csd summer workshop starting within month')
  .extend('csp summer workshop starting within month')
  .attr('course', 'CS Discoveries');

Factory.define('csp summer workshop starting in over a month')
  .extend('csp summer workshop')
  .attr('sessions', () =>
    Factory.buildList('session starting in over a month', 1)
  );

/**
 * SESSIONS
 */
Factory.define('session')
  .sequence('id')
  .attr('code', 'TEST')
  .attr('start', today.toISOString())
  .attr('end', today.toISOString())
  .attr('attendance_count', 0)
  .attr('show_link?', false);

Factory.define('session starting within month')
  .extend('session')
  .attr(
    'start',
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 15
    ).toISOString()
  )
  .attr(
    'end',
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 16
    ).toISOString()
  );

Factory.define('session starting in over a month')
  .extend('session')
  .attr(
    'start',
    new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      today.getDate()
    ).toISOString()
  )
  .attr(
    'end',
    new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      today.getDate()
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
