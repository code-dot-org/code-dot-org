import {Factory} from 'rosie';

Factory.define('CodeReviewComment')
  .sequence('id', n => n)
  .attr('name', 'Charlie Brown')
  .attr(
    'commentText',
    "Don't worry about the world coming to an end today. It's already tomorrow in Australia."
  )
  .attr('timestampString', '2021/01/01 at 9:30 AM')
  .attr('isResolved', false)
  .attr('isFromTeacher', false)
  .attr('isFromCurrentUser', false)
  .attr('isFromOlderVersionOfProject', false);
