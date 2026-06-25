/* React component to handle setting datatype for selected columns. */
import {ColumnTypes} from '../constants';
import {useAppDispatch} from '../hooks';
import I18n from '../i18n';
import {setColumnsByDataType} from '../redux';

interface ColumnDataTypeDropdownProps {
  columnId?: string;
  currentDataType?: string;
}

const ColumnDataTypeDropdown = ({
  columnId,
  currentDataType,
}: ColumnDataTypeDropdownProps) => {
  const dispatch = useAppDispatch();

  const handleChangeDataType = (
    event: React.ChangeEvent<HTMLSelectElement>,
    feature: string,
  ) => {
    event.preventDefault();
    dispatch(setColumnsByDataType(feature, event.target.value));
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

export default ColumnDataTypeDropdown;
