import {Factory} from 'rosie';

Factory.define('CodeReviewComment')
  .sequence('id', n => n)
  .attr('name', 'Charlie Brown')
  .attr(
    'commentText',
    "Don't worry about the world coming to an end today. It's already tomorrow in Australia."
  )
  .attr('timestampString', '2019-01-29T02:49:08.000Z')
  .attr('isResolved', false)
  .attr('isFromTeacher', false)
  .attr('isFromCurrentUser', false)
  .attr('isFromOlderVersionOfProject', false);
