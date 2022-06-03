import {Factory} from 'rosie';

Factory.define('CodeReviewComment')
  .sequence('id', n => n)
  .attr('name', 'Charlie Brown')
  .attr(
    'commentText',
    'This is brilliant and you are doing a great job and I love the simplicity here'
  )
  .attr('timestampString', '2019-01-29T02:49:08.000Z')
  .attr('onResolveStateToggle', () => {})
  .attr('onDelete', () => {})
  .attr('viewAsCodeReviewer', false)
  .attr('viewAsTeacher', false);
