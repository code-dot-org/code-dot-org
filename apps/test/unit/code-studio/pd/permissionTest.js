import {expect} from 'chai';
import Permission from '@cdo/apps/code-studio/pd/permission';

describe("Permission class", () => {
  const setGlobalPermissionString = (permissionString) => {
    window.dashboard = {
      workshop: {
        permission: permissionString
      }
    };
  };

  it("Detects workshop admin", () => {
    setGlobalPermissionString("workshop_admin");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.true;
    expect(permission.isFacilitator).to.be.false;
    expect(permission.isOrganizer).to.be.false;
    expect(permission.isProgramManager).to.be.false;
    expect(permission.isPartner).to.be.false;
  });

  it("Detects facilitator", () => {
    setGlobalPermissionString("[facilitator]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.true;
    expect(permission.isOrganizer).to.be.false;
    expect(permission.isPartner).to.be.false;
  });

  it("Detects organizer", () => {
    setGlobalPermissionString("[workshop_organizer]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.false;
    expect(permission.isOrganizer).to.be.true;
    expect(permission.isProgramManager).to.be.false;
    expect(permission.isPartner).to.be.false;
  });

  it("Detects program manager", () => {
    setGlobalPermissionString("[program_manager]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.false;
    expect(permission.isOrganizer).to.be.false;
    expect(permission.isProgramManager).to.be.true;
    expect(permission.isPartner).to.be.false;
  });

  it("Detects partner", () => {
    setGlobalPermissionString("[partner]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.false;
    expect(permission.isOrganizer).to.be.false;
    expect(permission.isProgramManager).to.be.false;
    expect(permission.isPartner).to.be.true;
  });

  it("Detects multiple permissions for organizer-partners", () => {
    setGlobalPermissionString("[workshop_organizer,partner]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.false;
    expect(permission.isOrganizer).to.be.true;
    expect(permission.isProgramManager).to.be.false;
    expect(permission.isPartner).to.be.true;
  });

  it("Detects multiple permissions for CSF Facilitators", () => {
    setGlobalPermissionString("[facilitator,workshop_organizer]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.true;
    expect(permission.isOrganizer).to.be.true;
    expect(permission.isProgramManager).to.be.false;
    expect(permission.isPartner).to.be.false;
  });

  it("Detects multiple permissions for organizer-program_managers", () => {
    setGlobalPermissionString("[program_manager,workshop_organizer]");
    const permission = new Permission();
    expect(permission.isWorkshopAdmin).to.be.false;
    expect(permission.isFacilitator).to.be.false;
    expect(permission.isOrganizer).to.be.true;
    expect(permission.isProgramManager).to.be.true;
    expect(permission.isPartner).to.be.false;
  });
});
