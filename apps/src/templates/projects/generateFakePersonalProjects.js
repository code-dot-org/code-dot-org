import _ from 'lodash';

// Generate n fake personal projects for the project widget.
export function generateFakePersonalProjects(n) {
  return _.range(n).map(i => (
    {
      name: "Personal " + i,
      updatedAt: Date.now() - i * 60 * 1000,
      projectType: 'gamelab',
      id: 'abcd'
    }
  ));
}
