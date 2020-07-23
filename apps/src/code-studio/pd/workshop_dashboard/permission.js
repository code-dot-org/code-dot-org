import PropTypes from 'prop-types';

export default class Permission {
  /**
   * Constructs a Permission object from a list of permission strings
   * @param permissions {array} of permission strings
   */
  constructor(permissions = []) {
    this.permissions = new Set(permissions);
  }

  has = name => this.permissions.has(name);
  hasAny = (...names) => names.some(name => this.has(name));
  hasAll = (...names) => names.every(name => this.has(name));
}

export const WorkshopAdmin = 'WorkshopAdmin';
export const Facilitator = 'Facilitator';
export const CsfFacilitator = 'CsfFacilitator';
export const Organizer = 'Organizer';
export const ProgramManager = 'ProgramManager';

export const PermissionPropType = PropTypes.shape({
  has: PropTypes.func,
  hasAny: PropTypes.func,
  hasAll: PropTypes.func
});
