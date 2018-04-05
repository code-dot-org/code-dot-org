import {expect} from 'chai';
import Permission, {
  WorkshopAdmin,
  Facilitator,
  Organizer,
  ProgramManager,
  Partner
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';

const permissionTypes = [
  WorkshopAdmin,
  Facilitator,
  Organizer,
  ProgramManager,
  Partner
];

describe("Permission class", () => {
  let permission;

  /**
   * Verify each permission based on a list of expected permissions
   * It ensures that each expected permission is present, and all others are absent
   * @param expectedPermissions
   */
  const expectExactPermissions = (...expectedPermissions) => {
    permissionTypes.forEach(permissionType => {
      if (expectedPermissions.includes(permissionType)) {
        expect(permission.has(permissionType)).to.be.true;
      } else {
        expect(permission.has(permissionType)).to.be.false;
      }
    });
  };

  permissionTypes.forEach(permissionType => {
    it(`Detects ${permissionType}`, () => {
      permission = new Permission([permissionType]);
      expectExactPermissions(permissionType);
    });
  });

  it("Detects multiple permissions for organizer-partners", () => {
    permission = new Permission([Organizer, Partner]);
    expectExactPermissions(Organizer, Partner);
  });

  it("Detects multiple permissions for CSF Facilitators", () => {
    permission = new Permission([Facilitator, Organizer]);
    expectExactPermissions(Facilitator, Organizer);
  });

  it("Detects multiple permissions for organizer-program_managers", () => {
    permission = new Permission([ProgramManager, Organizer]);
    expectExactPermissions(ProgramManager, Organizer);
  });
});
