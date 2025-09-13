export const codeReviewV2CommentFactory = {
  id: 1,
  build(attrs) {
    const id = this.id++;
    return {
      id,
      commenterId: id,
      commenterName: 'Charlie Brown',
      comment:
        'This is brilliant and you are doing a great job and I love the simplicity here',
      isResolved: false,
      createdAt: '2022-03-31T04:58:42.000Z',
      isFromTeacher: false,
      ...attrs,
    };
  },
};
