import React, {useState, useEffect} from 'react';

import {SearchField, SearchParams} from '../types/levels';

interface LevelsSearchProps {
  searchFields: SearchField[];
  onSearch: (params: SearchParams) => void;
  initialValues: SearchParams;
}

const LevelsSearch: React.FC<LevelsSearchProps> = ({
  searchFields,
  onSearch,
  initialValues,
}) => {
  const [formData, setFormData] = useState<SearchParams>(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <tr>
            {searchFields.map(field => (
              <td key={field.name}>
                <label htmlFor={field.name}>{field.description}</label>
              </td>
            ))}
            <td />
          </tr>
          <tr>
            {searchFields.map(field => (
              <td key={field.name}>
                {field.type === 'text' ? (
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={
                      formData[field.name as keyof SearchParams]?.toString() ||
                      ''
                    }
                    onChange={e =>
                      handleFieldChange(field.name, e.target.value)
                    }
                  />
                ) : (
                  <select
                    id={field.name}
                    name={field.name}
                    value={
                      formData[field.name as keyof SearchParams]?.toString() ||
                      ''
                    }
                    onChange={e =>
                      handleFieldChange(field.name, e.target.value)
                    }
                  >
                    <option value="">All</option>
                    {field.options?.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            ))}
            <td>
              <button type="submit">Search</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
};

export default LevelsSearch;
