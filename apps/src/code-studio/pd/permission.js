export default class Permission {
  constructor() {
    this.isAdmin = this.hasPermission('workshop_admin');
    this.isFacilitator = this.hasPermission('facilitator');
    this.isOrganizer = this.hasPermission('workshop_organizer');
    this.isPartner = this.hasPermission('partner');
  }

  hasPermission(name) {
    return window.dashboard.workshop.permission.indexOf(name) >= 0;
  }
}
