import PropTypes from 'prop-types';

const commentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  commentText: PropTypes.string.isRequired,
  timestampString: PropTypes.string.isRequired,
  isResolved: PropTypes.bool,
  isFromTeacher: PropTypes.bool,
  isFromProjectOwner: PropTypes.bool,
  isFromOlderVersionOfProject: PropTypes.bool
});

// Will delete once we've connected the UI to the back end.
const demoComments = [
  {
    id: 1,
    name: 'Another Student',
    commentText:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: false,
    isFromTeacher: false,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: false
  },
  {
    id: 2,
    name: 'Older Version',
    commentText:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: true,
    isFromTeacher: false,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: true
  },
  {
    id: 3,
    name: 'Resolved Comment',
    commentText:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: true,
    isFromTeacher: false,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: false
  },
  {
    id: 4,
    name: 'Mr. Teacher',
    commentText:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: false,
    isFromTeacher: true,
    isFromProjectOwner: false,
    isFromOlderVersionOfProject: false
  },
  {
    id: 5,
    name: 'Project Owner',
    commentText:
      "Don't worry about the world coming to an end today. It's already tomorrow in Australia.",
    timestampString: '2020/01/01 at 9:30 AM',
    isResolved: false,
    isFromTeacher: false,
    isFromProjectOwner: true,
    isFromOlderVersionOfProject: false
  }
];

export {commentShape, demoComments};
