import {createSkill} from '@cdo/apps/levelbuilder/skills/SkillsApi';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('skillsApi', () => {
  const skillData = {
    id: 0,
    key: 'new_skill',
    description: 'This is a new skill',
    evaluationCriteria: 'Criteria for evaluation',
    concept: 'Testing',
  };
  const successResponse = {
    status: 'success',
    message: 'Skill saved successfully',
  };

  const spy = jest.spyOn(HttpClient, 'post');

  beforeEach(() => {
    spy.mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({'Content-Type': 'application/json'}),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSkill', () => {
    it('should call createSkill with correct URL and valid parameters', async () => {
      const response = await createSkill(skillData);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        '/skills',
        JSON.stringify(skillData),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      );
      expect(response).toEqual(successResponse);
    });
  });
});
