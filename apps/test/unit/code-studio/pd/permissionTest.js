import {expect} from 'chai';
import Permission, {
  WorkshopAdmin,
  Facilitator,
  Organizer,
  ProgramManager,
  Partner
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';

describe("Permission class", () => {
  it("Detects workshop admin", () => {
    const permission = new Permission([WorkshopAdmin]);
    expect(permission.has(WorkshopAdmin)).to.be.true;
    expect(permission.has(Facilitator)).to.be.false;
    expect(permission.has(Organizer)).to.be.false;
    expect(permission.has(ProgramManager)).to.be.false;
    expect(permission.has(Partner)).to.be.false;
  });

  it("Detects facilitator", () => {
    const permission = new Permission([Facilitator]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.true;
    expect(permission.has(Organizer)).to.be.false;
    expect(permission.has(Partner)).to.be.false;
  });

  it("Detects organizer", () => {
    const permission = new Permission([Organizer]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.false;
    expect(permission.has(Organizer)).to.be.true;
    expect(permission.has(ProgramManager)).to.be.false;
    expect(permission.has(Partner)).to.be.false;
  });

  it("Detects program manager", () => {
    const permission = new Permission([ProgramManager]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.false;
    expect(permission.has(Organizer)).to.be.false;
    expect(permission.has(ProgramManager)).to.be.true;
    expect(permission.has(Partner)).to.be.false;
  });

  it("Detects partner", () => {
    const permission = new Permission([Partner]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.false;
    expect(permission.has(Organizer)).to.be.false;
    expect(permission.has(ProgramManager)).to.be.false;
    expect(permission.has(Partner)).to.be.true;
  });

  it("Detects multiple permissions for organizer-partners", () => {
    const permission = new Permission([Organizer, Partner]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.false;
    expect(permission.has(Organizer)).to.be.true;
    expect(permission.has(ProgramManager)).to.be.false;
    expect(permission.has(Partner)).to.be.true;
  });

  it("Detects multiple permissions for CSF Facilitators", () => {
    const permission = new Permission([Facilitator, Organizer]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.true;
    expect(permission.has(Organizer)).to.be.true;
    expect(permission.has(ProgramManager)).to.be.false;
    expect(permission.has(Partner)).to.be.false;
  });

  it("Detects multiple permissions for organizer-program_managers", () => {
    const permission = new Permission([ProgramManager, Organizer]);
    expect(permission.has(WorkshopAdmin)).to.be.false;
    expect(permission.has(Facilitator)).to.be.false;
    expect(permission.has(Organizer)).to.be.true;
    expect(permission.has(ProgramManager)).to.be.true;
    expect(permission.has(Partner)).to.be.false;
  });
});
