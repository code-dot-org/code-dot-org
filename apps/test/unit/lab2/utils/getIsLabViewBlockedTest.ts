import {getIsLabViewBlocked} from '@cdo/apps/lab2/utils/getIsLabViewBlocked';

describe('getIsLabViewBlocked', () => {
  describe('share mode', () => {
    describe('when project blocked because of abuse', () => {
      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'share',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('blocks access for owner in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          true, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('blocks access for teacher of project owner in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          true, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('blocks access for project validator in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          true // isProjectValidator
        );
        expect(result).toBe(true);
      });
    });

    describe('when project blocked because project sharing is disabled', () => {
      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('allows access for owner in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          true, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });

      it('allows access for teacher of project owner in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          true, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });

      it('blocks access for project validator in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          true // isProjectValidator
        );
        expect(result).toBe(true);
      });
    });

    describe('when project blocked because of a privacy/profanity violation', () => {
      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('blocks access for owner in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          true, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('blocks access for teacher of project owner in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          true, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('blocks access for project validator in share mode', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          true // isProjectValidator
        );
        expect(result).toBe(true);
      });
    });

    describe('when project is not blocked', () => {
      it('allows access when no blocking flags are set', () => {
        const result = getIsLabViewBlocked(
          'share',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });
  });

  describe('view mode', () => {
    describe('when project is blocked because of sharing is disabled', () => {
      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('allows access for teacher of project owner in view mode', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          true, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });

      it('allows access for project validator in view mode', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          true // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });
    describe('when project is blocked because of abuse', () => {
      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'view',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('allows access for teacher of project owner in view mode', () => {
        const result = getIsLabViewBlocked(
          'view',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          true, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });

      it('allows access for project validator in view mode', () => {
        const result = getIsLabViewBlocked(
          'view',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          true // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });

    describe('when project is blocked because of a privacy/profanity violation', () => {
      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });

      it('allows access for teacher of project owner in view mode', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          true, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });

      it('allows access for project validator in view mode', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          true // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });

    describe('when project is not blocked', () => {
      it('allows access when no blocking flags are set', () => {
        const result = getIsLabViewBlocked(
          'view',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });
  });

  describe('edit mode', () => {
    describe('when project is blocked because of abuse', () => {
      it('allows access for owner - only owner can edit', () => {
        const result = getIsLabViewBlocked(
          'edit',
          true, // isBlockedAbuse
          false, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          true, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });
    describe('when project is blocked because of sharing is disabled', () => {
      it('allows access for owner - only owner can edit', () => {
        const result = getIsLabViewBlocked(
          'edit',
          false, // isBlockedAbuse
          true, // projectSharingDisabled
          false, // hasPrivacyProfanityViolation
          true, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });
    });
    describe('when project is blocked because of a privacy/profanity violation', () => {
      it('allows access for owner - only owner can edit', () => {
        const result = getIsLabViewBlocked(
          'edit',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          true, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(false);
      });

      it('blocks access when user has no elevated privileges', () => {
        const result = getIsLabViewBlocked(
          'edit',
          false, // isBlockedAbuse
          false, // projectSharingDisabled
          true, // hasPrivacyProfanityViolation
          false, // isOwner
          false, // isTeacherOfProjectOwner
          false // isProjectValidator
        );
        expect(result).toBe(true);
      });
    });
  });
});
