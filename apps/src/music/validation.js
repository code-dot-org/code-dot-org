export default class Validation {
  constructor() {
    this.clear();
  }

  clear() {
    this.currentConditions = {};
  }

  addCurrentCondition(id, value) {
    this.currentConditions[id] = value;
  }

  checkValidation(requirements) {
    // Go through each requirement, and return the first to fail.
    for (const requirement of requirements) {
      if (
        this.checkConditions(this.currentConditions, requirement.conditions)
      ) {
        return requirement;
      }
    }

    // Or return false if we didn't find something.
    return false;
  }

  checkRequirementConditions(requirementConditions) {
    return this.checkConditions(this.currentConditions, requirementConditions);
  }

  checkConditions(currentConditions, requiredConditions) {
    // Ensure that all conditions in full are achieved in current.
    for (const requiredCondition of requiredConditions) {
      if (!currentConditions[requiredCondition]) {
        return false;
      }
    }
    return true;
  }
}
