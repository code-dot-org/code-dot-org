import $ from 'jquery';

import {commands} from '@cdo/apps/lib/util/mlApi';

describe('mlApi', function () {
  beforeEach(() => {
    jest
      .spyOn($, 'ajax')
      .mockClear()
      .mockImplementation(() => {
        const deferred = $.Deferred();
        deferred.resolve({
          name: 'Medical Priority v3',
          columns: [
            {
              id: 'age',
              description: 'Age ranges of the patient',
            },
            {
              id: 'gender',
              description: 'Gender of the patient',
            },
            {
              id: 'race',
              description: 'Racial information about the patient',
            },
            {
              id: 'bleeding',
              description: 'Whether or not the patient was bleeding',
            },
            {
              id: 'shortness_of_breath',
              description: 'Whether or not the patient had shortness of breath',
            },
            {
              id: 'weight',
              description: 'Weight ranges for the patient',
            },
            {
              id: 'area_of_pain',
              description: 'Where the pain was located',
            },
            {
              id: 'decision',
              description: 'How quickly the patient received treatment',
            },
          ],
          potentialUses:
            'Help determine the priority for people entering an Emergency Room so doctors and nurses can better help people with potentially serious injuries.',
          potentialMisuses:
            "This model shouldn't be used in a way that could reduce the care for people entering an emergency room.",
          identifySubgroup: true,
          representSubgroup: false,
          decisionsLife: true,
          selectedTrainer: 'knnClassify',
          selectedFeatures: [
            'age',
            'gender',
            'race',
            'bleeding',
            'shortness_of_breath',
            'weight',
            'area_of_pain',
          ],
          featureNumberKey: {
            age: {
              'Over 60': 0,
              '18-34': 1,
              'Under 18': 2,
              '35-60': 3,
            },
            gender: {
              male: 0,
              female: 1,
            },
            race: {
              W: 0,
              BAM: 1,
              A: 2,
              NHPI: 3,
              AIAN: 4,
            },
            bleeding: {
              yes: 0,
              no: 1,
            },
            shortness_of_breath: {
              no: 0,
              yes: 1,
            },
            weight: {
              'under 100 lbs': 0,
              '150-200 lbs': 1,
              'Over 300 lbs': 2,
              '100-150 lbs': 3,
              '200-300 lbs': 4,
            },
            area_of_pain: {
              stomach: 0,
              limb: 1,
              chest: 2,
              head: 3,
            },
            decision: {
              normal: 0,
              priority: 1,
              return_later: 2,
            },
          },
          labelColumn: 'decision',
          summaryStat: {
            type: 'classification',
            stat: '81.00',
          },
          trainedModel: {
            name: 'KNN',
            kdTree: {
              obj: [1, 1, 2, 1, 0, 4, 2, 0],
              left: {
                obj: [0, 0, 0, 0, 0, 1, 0, 0],
                left: null,
                right: null,
                parent: null,
                dimension: 1,
              },
              right: {
                obj: [1, 0, 0, 0, 0, 1, 0, 2],
                left: null,
                right: null,
                parent: null,
                dimension: 1,
              },
              dimensions: [0, 1],
            },
            k: 4,
            classes: [0, 1, 2],
            isEuclidean: true,
          },
        });
        return deferred;
      });
  });

  afterEach(() => {
    $.ajax.mockRestore();
  });

  describe('getPrediction', function () {
    it('handles a lack of labels', async function () {
      const options = {
        callback: () => {},
        modelId: 'foo',
        testValues: {
          age: 'Over 60',
          area_of_pain: 'stomach',
          bleeding: 'yes',
          gender: 'male',
          race: 'W',
          shortness_of_breath: 'no',
          weight: '150-200 lbs',
        },
      };
      await commands.getPrediction(options);
    });
  });
});
