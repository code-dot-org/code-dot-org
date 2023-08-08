import * as GoogleBlockly from 'blockly/core';
// import {ProcedureParameterRename} from './events_procedure_parameter_rename';
// import {triggerProceduresUpdate} from './update_procedures';
import {
  ProcedureParameterRename,
  triggerProceduresUpdate,
} from '@blockly/block-shareable-procedures';
/** Represents a procedure parameter. */
export class CdoParameterModel {
  constructor(workspace, name, id, varId, type) {
    this.workspace = workspace;
    this.id = id || GoogleBlockly.utils.idGenerator.genUid();
    this.variable =
      this.workspace.getVariable(name, type) ||
      workspace.createVariable(name, type, varId);
    this.shouldFireEvents = false;
    this.procedureModel = null;
    this.types = [type];
  }

  setName(name, type, id) {
    if (name === this.variable.name) return this;
    const oldName = this.variable.name;
    this.variable =
      this.workspace.getVariable(name, type) ||
      this.workspace.createVariable(name, type, id);
    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      GoogleBlockly.Events.fire(
        new ProcedureParameterRename(
          this.workspace,
          this.procedureModel,
          this,
          oldName
        )
      );
    }
    return this;
  }

  setTypes(types) {
    this.types = types;
    if (this.variable.type === '' && types) {
      // Variable was created by Procedure serializer without the expected type.
      this.workspace.deleteVariableById(this.variable.getId());
    }
  }

  getName() {
    return this.variable.name;
  }

  getTypes() {
    return this.types;
  }

  getId() {
    return this.id;
  }

  getVariableModel() {
    return this.variable;
  }

  startPublishing() {
    this.shouldFireEvents = true;
  }

  stopPublishing() {
    this.shouldFireEvents = false;
  }

  setProcedureModel(model) {
    this.procedureModel = model;
    return this;
  }
}
