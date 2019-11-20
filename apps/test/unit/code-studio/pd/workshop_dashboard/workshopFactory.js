import {Factory} from 'rosie';
import {States} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * Factory for the workshop object passed around by workshop dashboard components,
 * as retrieved from /api/v1/pd/workshops/<workshop-id>
 */
Factory.define('workshop')
  .sequence('id')
  .attr('course', 'CS Fundamentals')
  .attr('subject', 'Intro')
  .attr('sessions', () => Factory.buildList('session', 1))
  .attr('state', States[0])
  .attr('account_required_for_attendance?', false)
  .attr('scholarship_workshop?', false);

Factory.define('session')
  .sequence('id')
  .attr('code', 'TEST')
  .attr('start', new Date().toISOString())
  .attr('end', new Date().toISOString())
  .attr('attendance_count', 0)
  .attr('show_link?', false);
