import {expect} from '../../../util/deprecatedChai';
import {setRecommendedAndSelectedVersions} from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';

const fakeVersions = [
  {
    name: 'coursea-2017',
    year: '2017',
    title: '2017',
    isStable: true,
    locales: ['English', 'Spanish']
  },
  {
    name: 'coursea-2018',
    year: '2018',
    title: '2018',
    isStable: true,
    locales: ['English']
  },
  {
    name: 'coursea-2019',
    year: '2019',
    title: '2019',
    isStable: false,
    locales: ['English']
  }
];

describe('AssignmentVersionSelector', () => {
  describe('setRecommendedAndSelectedVersions', () => {
    it('sets latest stable version supported in locale to isRecommended if locale provided', () => {
      const versions = JSON.parse(JSON.stringify(fakeVersions));
      const response = setRecommendedAndSelectedVersions(versions, 'Spanish');
      const recommendedVersion = response.find(v => v.isRecommended);
      const selectedVersion = response.find(v => v.isSelected);

      expect(recommendedVersion.name).to.equal('coursea-2017');
      expect(selectedVersion.name).to.equal('coursea-2017');
    });

    it('sets latest stable version to isRecommended if locale is not provided', () => {
      const versions = JSON.parse(JSON.stringify(fakeVersions));
      const response = setRecommendedAndSelectedVersions(versions);
      const recommendedVersion = response.find(v => v.isRecommended);
      const selectedVersion = response.find(v => v.isSelected);

      expect(recommendedVersion.name).to.equal('coursea-2018');
      expect(selectedVersion.name).to.equal('coursea-2018');
    });

    it('sets isSelected on selected version if selectedVersionYear is provided', () => {
      const versions = JSON.parse(JSON.stringify(fakeVersions));
      const response = setRecommendedAndSelectedVersions(
        versions,
        null,
        '2017'
      );
      const recommendedVersion = response.find(v => v.isRecommended);
      const selectedVersion = response.find(v => v.isSelected);

      expect(recommendedVersion.name).to.equal('coursea-2018');
      expect(selectedVersion.name).to.equal('coursea-2017');
    });
  });
});
