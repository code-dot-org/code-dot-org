import React from 'react';
import CountryData from 'country-data';

/**
 * @return {boolean}
 */
const ASSIGNED_COUNTRY_FILTER = countryData => {
  return countryData.status === "assigned"; // limit to countries in the ISO 3166 standard
};

const COUNTRY_CODE_AND_NAME_EXTRACTOR = countryData => ({
  countryCode: countryData.alpha2,
  countryName: countryData.name
});

/**
 * Comparator to sort by countryName field
 * @return {number}
 */
const SORT_BY_COUNTRY_NAME = (a, b) => {
  const aUpper = a.countryName.toUpperCase();
  const bUpper = b.countryName.toUpperCase();
  if (aUpper < bUpper) {
    return -1;
  }
  if (aUpper > bUpper) {
    return 1;
  }
  return 0;
};

function getAllCountriesAndCodes(usFirst) {
  const allCountriesAndCodes = CountryData.countries.all
    .filter(ASSIGNED_COUNTRY_FILTER)
    .map(COUNTRY_CODE_AND_NAME_EXTRACTOR)
    .sort(SORT_BY_COUNTRY_NAME)
  ;

  if (!usFirst) {
    return allCountriesAndCodes;
  }

  let usData = allCountriesAndCodes.find(countryData => countryData.countryCode === "US");
  // Pull US entry to front of array
  return [usData].concat(
    allCountriesAndCodes.filter(countryData => {
      return countryData.countryCode !== "US";
    })
  );
}

function SchoolCountry(props) {
  const allCountriesAndCodes = getAllCountriesAndCodes(props.usFirst);

  return (
    <div className="itemblock">
      <div className="labelblock">School Country</div>
      <select
        className="form-control fieldblock"
        id="school-country"
        name="user[school_info_attributes][country]"
        type="select" value={props.country}
        onChange={props.onChange}
      >
        {
          allCountriesAndCodes.map(countryData =>
            <option
              value={countryData.countryCode}
              key={countryData.countryCode}
            >
              {countryData.countryName}
            </option>
          )
        }
      </select>
    </div>
  );
}

SchoolCountry.propTypes = {
  country: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  usFirst: React.PropTypes.bool,
};

SchoolCountry.defaultProps = {
  usFirst: true
};

export default SchoolCountry;
