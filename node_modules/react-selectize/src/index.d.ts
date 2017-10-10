import * as React from 'react';

export interface OptionValue {
  label: string;
  value: any;
}

export interface SimpleSelectEvent {
  originalEvent: Event;
  value: OptionValue;
  open: boolean;
}

export interface MultipleSelectEvent {
  originalEvent: Event;
  values: OptionValue[];
  open: boolean;
}

export interface SimpleSelectProps {
  autofocus?: boolean;
  cancelKeyboardEventOnSelection?: boolean;
  className?: string;
  createFromSearch?(items: OptionValue[], search: string): OptionValue;
  defaultValue?: OptionValue;
  delimiters?: [any];
  disabled?: boolean;
  dropdownDirection?: number;
  editable?(item: OptionValue): string;
  filterOptions?(items: OptionValue[], search: string): OptionValue[];
  firstOptionIndexToHighlight?(index: number, items: OptionValue[], item: OptionValue, search: string): number;
  groupId?(item: OptionValue): any;
  groups?: any[];
  groupsAsColumns?: boolean;
  hideResetButton?: boolean;
  highlightedUid?: any;
  name?: string;
  open?: boolean;
  onBlur?(event: SimpleSelectEvent): void;
  onFocus?(event: SimpleSelectEvent): void;
  onHighlightedUidChange?(uid: any): void;
  onKeyboardSelectionFailed?(keycode: number): void;
  onOpenChange?(open: boolean): void;
  onPaste?(event: SimpleSelectEvent): void;
  onSearchChange?(search: string): void;
  onValueChange?(item: OptionValue): void;    
  options?: OptionValue[];
  placeholder?: string;
  renderGroupTitle?(index: number, group: any): React.ReactElement<any>;
  renderNoResultsFound?(item: OptionValue, search: string): React.ReactElement<any>;
  renderOption?(item: OptionValue): React.ReactElement<any>;
  renderResetButton?(): React.ReactElement<any>;
  renderToggleButton?(options: {open: boolean, flipped: any}): React.ReactElement<any>;
  renderValue?(item: OptionValue): React.ReactElement<any>;
  restoreOnBackspace?(item: OptionValue): string;
  search?: string;
  serialize?(item: OptionValue): string;
  style?: any;
  tether?: boolean;
  'tether-props'?: any;
  theme?: string;
  transitionEnter?: boolean;
  transitionEnterTimeout?: number;
  transitionLeave?: boolean;
  transitionLeaveTimeout?: number;
  uid?(item: OptionValue): any;
  value?: OptionValue;
  valueFromPaste?(options: OptionValue[], value: OptionValue, pastedText: string): OptionValue;
}

declare class SimpleSelect extends React.Component<SimpleSelectProps, any> {
  
}

export interface MultiSelectProps extends SimpleSelectProps {
  anchor?: OptionValue;
  createFromSearch?(items: OptionValue[], search: string): OptionValue;
  createFromSearch?(options: OptionValue[], values: OptionValue[], search: string): OptionValue;
  defaultValues?: OptionValue[];
  filterOptions?(items: OptionValue[], search: string): OptionValue[];
  filterOptions?(options: OptionValue[], values: OptionValue[], search: string): OptionValue[];
  onAnchorChange?(item: OptionValue): void;
  onBlur?(event: SimpleSelectEvent): void;
  onBlur?(event: MultipleSelectEvent): void;
  onFocus?(event: SimpleSelectEvent): void;
  onFocus?(event: MultipleSelectEvent): void;
  onValuesChange?(item: OptionValue): void;
  maxValues?: number;
  closeOnSelect?: boolean;
  valuesFromPaste?(options: OptionValue[], values: OptionValue[], pastedText: string): OptionValue[];
}

declare class MultiSelect extends React.Component<MultiSelectProps, any> {
  
}