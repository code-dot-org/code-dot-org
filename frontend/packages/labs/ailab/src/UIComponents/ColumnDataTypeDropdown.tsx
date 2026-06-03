/* React component to handle setting datatype for selected columns. */
import {connect} from 'react-redux';
import {RootState, setColumnsByDataType} from '../redux';
import {ColumnTypes} from '../constants';
import I18n from '../i18n';

interface ColumnDataTypeDropdownProps {
  columnId?: string;
  currentDataType?: string;
  setColumnsByDataType: (column: string, dataType: string) => void;
}

const ColumnDataTypeDropdown = ({
  columnId,
  currentDataType,
  setColumnsByDataType,
}: ColumnDataTypeDropdownProps) => {
  const handleChangeDataType = (
    event: React.ChangeEvent<HTMLSelectElement>,
    feature: string,
  ) => {
    event.preventDefault();
    setColumnsByDataType(feature, event.target.value);
  };

  return (
    <div>
      <select
        onChange={event => handleChangeDataType(event, columnId!)}
        value={currentDataType}
      >
        {Object.values(ColumnTypes).map((option, index) => {
          return (
            <option key={index} value={option}>
              {I18n.t(`columnType_${option}`)}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default connect(
  (state: RootState) => ({}),
  dispatch => ({
    setColumnsByDataType(column: string, dataType: string) {
      dispatch(setColumnsByDataType(column, dataType));
    },
  }),
)(ColumnDataTypeDropdown);
