import {Factory} from 'rosie';

Factory.define('CodeReviewV2Comment')
  .sequence('commenterId', n => n)
  .sequence('id', n => n)
  .attr('commenterName', 'Charlie Brown')
  .attr(
    'comment',
    'This is brilliant and you are doing a great job and I love the simplicity here'
  )
  .attr('isResolved', false)
  .attr('createdAt', '2022-03-31T04:58:42.000Z')
  .attr('isFromTeacher', false);
