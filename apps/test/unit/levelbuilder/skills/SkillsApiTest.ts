import {
  createSkill,
  addSkillToLevel,
  removeSkillFromLevel,
  updateSkill,
} from '@cdo/apps/levelbuilder/skills/SkillsApi';
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

  describe('addSkillToLevel', () => {
    const levelSkillData = {levelId: 1, skillId: 2};
    const levelSkillSuccessResponse = {
      status: 'success',
      message: 'LevelsSkill saved successfully',
    };
    const postSpy = jest.spyOn(HttpClient, 'post');

    beforeEach(() => {
      postSpy.mockResolvedValue(
        new Response(JSON.stringify(levelSkillSuccessResponse), {
          status: 201,
          statusText: 'Created',
          headers: new Headers({'Content-Type': 'application/json'}),
        })
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call createLevelsSkill with correct URL and valid parameters', async () => {
      const response = await addSkillToLevel(levelSkillData);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(
        `/levels/${levelSkillData.levelId}/add_skill`,
        JSON.stringify(levelSkillData),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      );
      expect(response).toEqual(levelSkillSuccessResponse);
    });
  });

  describe('removeSkillFromLevel', () => {
    const levelSkillData = {levelId: 1, skillId: 2};
    const removeSuccessResponse = {
      status: 'success',
      message: 'LevelsSkill deleted successfully',
    };
    const deleteSpy = jest.spyOn(HttpClient, 'post');

    beforeEach(() => {
      deleteSpy.mockResolvedValue(
        new Response(JSON.stringify(removeSuccessResponse), {
          status: 200,
          statusText: 'OK',
          headers: new Headers({'Content-Type': 'application/json'}),
        })
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call removeSkillFromLevel with correct URL and return success', async () => {
      const response = await removeSkillFromLevel(levelSkillData);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(
        `/levels/${levelSkillData.levelId}/remove_skill`,
        JSON.stringify(levelSkillData),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      );
      expect(response).toEqual(removeSuccessResponse);
    });
  });

  describe('updateSkill', () => {
    const skillId = 1;
    const updatedSkillData = {
      key: 'updated_skill',
      description: 'Updated description',
    };
    const updateSuccessResponse = {
      status: 'success',
      message: 'Skill updated successfully',
    };
    const putSpy = jest.spyOn(HttpClient, 'put');

    beforeEach(() => {
      putSpy.mockResolvedValue(
        new Response(JSON.stringify(updateSuccessResponse), {
          status: 200,
          statusText: 'OK',
          headers: new Headers({'Content-Type': 'application/json'}),
        })
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call updateSkill with correct URL and parameters', async () => {
      const response = await updateSkill(skillId, updatedSkillData);
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(
        `/skills/${skillId}`,
        JSON.stringify(updatedSkillData),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      );
      expect(response).toEqual(updateSuccessResponse);
    });
  });
});
