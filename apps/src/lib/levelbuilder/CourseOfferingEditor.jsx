import $ from 'jquery';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Select from 'react-select';

import {
  CourseOfferingHeaders,
  CourseOfferingCurriculumTypes,
  CourseOfferingMarketingInitiatives,
  CourseOfferingCsTopics,
  CourseOfferingSchoolSubjects,
  DeviceTypes,
  DeviceCompatibilityLevels,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDeviceTypes,
  translatedCourseOfferingDeviceCompatibilityLevels,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';
import {StudentGradeLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import DatePicker from '../../code-studio/pd/workshop_dashboard/components/date_picker';

import ImageInput from './ImageInput';

import 'react-select/dist/react-select.css';

const translatedNoneOption = `(${i18n.none()})`;

const useCourseOffering = initialCourseOffering => {
  const [courseOffering, setCourseOffering] = useState(initialCourseOffering);
  const updateCourseOffering = (key, value) => {
    setCourseOffering({...courseOffering, [key]: value !== '' ? value : null});
  };

  return [courseOffering, updateCourseOffering];
};

export default function CourseOfferingEditor(props) {
  const [courseOffering, updateCourseOffering] = useCourseOffering(
    props.initialCourseOffering
  );
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    courseOffering.published_date ? moment(courseOffering.published_date) : null
  );

  const handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    setError(null);
    setLastSaved(null);
    setIsSaving(true);

    $.ajax({
      url: `/course_offerings/${courseOffering.key}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(courseOffering),
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          navigateToHref(linkWithQueryParams('/'));
        } else {
          setLastSaved(Date.now());
          setIsSaving(false);
        }
      })
      .fail(error => {
        setError(error.responseText);
        setIsSaving(false);
      });
  };

  // Converts selected options within the given fieldName into a string for the table
  const handleMultipleSelected = (e, fieldName) => {
    var options = e.target.options;
    var selectedOptions = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected && options[i].value !== '') {
        selectedOptions.push(options[i].value);
      }
    }
    updateCourseOffering(fieldName, selectedOptions.join(','));
  };

  // Converts selected device compatibility options into a string for the table
  const updateDeviceCompatibilities = (device, compatibilityLevel) => {
    let updatedDeviceCompatibilities = {};
    let deviceCompatibilities = courseOffering.device_compatibility;

    // Initialize device compatibility values if empty, otherwise update given device compatibility level.
    if (!deviceCompatibilities) {
      DeviceTypes.forEach(currDevice => {
        updatedDeviceCompatibilities[currDevice] =
          currDevice === device ? compatibilityLevel : '';
      });
    } else {
      updatedDeviceCompatibilities = JSON.parse(deviceCompatibilities);
      updatedDeviceCompatibilities[device] = compatibilityLevel;
    }

    // Update device_compatibility field
    updateCourseOffering(
      'device_compatibility',
      JSON.stringify(updatedDeviceCompatibilities)
    );
  };

  // Gets the current device compatibility dropdown value
  const getDeviceCompatibility = device => {
    let deviceCompatibilities = courseOffering.device_compatibility;
    return deviceCompatibilities
      ? JSON.parse(deviceCompatibilities)[device]
      : translatedNoneOption;
  };

  const handleVideoSelection = e => {
    if (e) {
      const videoUrl = e.value !== 'None' ? e.value : null;
      setThumbnail(e.thumbnail);
      updateCourseOffering('video', videoUrl);
    } else {
      //Handles clear button
      setThumbnail(null);
      updateCourseOffering('video', null);
    }
  };

  const videoNoneOption = {
    value: 'None',
    label: (
      <div style={styles.dropdownLabel}>
        <div style={styles.label}>{translatedNoneOption}</div>
      </div>
    ),
    name: 'None',
    thumbnail: null,
  };

  const videoRenderedOptions = [
    videoNoneOption,
    ...props.videos.map(video => ({
      value: video.youtube_url,
      label: (
        <div style={styles.dropdownLabel}>
          <div style={styles.label}>{`${video.name} - ${video.locale}`}</div>
        </div>
      ),
      name: `${video.name} - ${video.locale}`,
      thumbnail: video.thumbnail,
    })),
  ];

  //Filters the video options by name
  const filterOption = (candidate, input) => {
    return candidate.name === 'None'
      ? true
      : candidate.name.toLowerCase().includes(input.toLowerCase());
  };

  const handleDateChange = date => {
    setSelectedDate(date);
    updateCourseOffering('published_date', date);
  };

  return (
    <div>
      <h1>{`Editing Course Offering: ${courseOffering.key}`}</h1>
      <label>
        Display Name
        <input
          type="text"
          value={courseOffering.display_name}
          style={styles.input}
          onChange={e => updateCourseOffering('display_name', e.target.value)}
        />
      </label>
      <label>
        Description
        <HelpTip>
          <p>
            Write a short description (1-2 sentences) to explain the course
            offering.
          </p>
        </HelpTip>
        <br />
        <textarea
          type="text"
          value={courseOffering.description}
          style={(styles.input, styles.descriptionInput)}
          onChange={e => updateCourseOffering('description', e.target.value)}
        />
      </label>
      <label>
        Featured In Category
        <HelpTip>
          <p>
            Featured items will show up at the top of the category in the
            assignment dropdown.
          </p>
        </HelpTip>
        <input
          type="checkbox"
          checked={courseOffering.is_featured}
          style={styles.checkbox}
          onChange={e => updateCourseOffering('is_featured', e.target.checked)}
        />
      </label>
      <label>
        Course Offering Assignable
        <HelpTip>
          <p>
            Assignable course offerings will show up in the assignment dropdown
            for instructors to assign to participants. Most courses will want
            this turned on.
          </p>
        </HelpTip>
        <input
          type="checkbox"
          checked={courseOffering.assignable}
          style={styles.checkbox}
          onChange={e => updateCourseOffering('assignable', e.target.checked)}
        />
      </label>
      <h2>Curriculum Catalog Settings</h2>
      <label>
        Grade Levels
        <HelpTip>
          <p>
            Select all recommended grade levels. Shift-click or cmd-click to
            select multiple.
          </p>
        </HelpTip>
        <select
          multiple
          value={courseOffering.grade_levels?.split(',')}
          style={styles.dropdown}
          onChange={e => handleMultipleSelected(e, 'grade_levels')}
        >
          <option value="">{translatedNoneOption}</option>
          {Object.values(StudentGradeLevels).map(level => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>
      <label>
        Curriculum Type
        <HelpTip>
          <p>
            These may not map exactly to our current curriculum model. For
            instance, Course A is implemented as a standalong unit but will be
            considered a Course.
          </p>
        </HelpTip>
        <select
          value={courseOffering.curriculum_type}
          style={styles.dropdown}
          onChange={e =>
            updateCourseOffering('curriculum_type', e.target.value)
          }
        >
          <option value="">{translatedNoneOption}</option>
          {Object.values(CourseOfferingCurriculumTypes).map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Header
        <HelpTip>
          <p>This represents the subHeader in curriculum quick assign.</p>
        </HelpTip>
        <select
          value={courseOffering.header}
          style={styles.dropdown}
          onChange={e => updateCourseOffering('header', e.target.value)}
        >
          <option value="">{translatedNoneOption}</option>
          {Object.entries(CourseOfferingHeaders).map(([key, header]) => (
            <option key={key} value={key}>
              {header}
            </option>
          ))}
        </select>
      </label>
      <label>
        Marketing Initiative
        <select
          value={courseOffering.marketing_initiative}
          style={styles.dropdown}
          onChange={e =>
            updateCourseOffering('marketing_initiative', e.target.value)
          }
        >
          <option value="">{translatedNoneOption}</option>
          {Object.values(CourseOfferingMarketingInitiatives).map(initiative => (
            <option key={initiative} value={initiative}>
              {initiative}
            </option>
          ))}
        </select>
      </label>
      <ImageInput
        initialImageUrl={courseOffering.image}
        updateImageUrl={img => updateCourseOffering('image', img)}
        showPreview={true}
        helpTipText={'Image used to market the curriculum around the site.'}
      />
      <label style={styles.videoContainer}>
        Video
        <HelpTip>
          <p>
            Search and select the corresponding video for the course offering.
          </p>
        </HelpTip>
        <div style={{width: '75%'}}>
          <Select
            options={videoRenderedOptions}
            filterOption={filterOption}
            value={
              courseOffering.video === null ? 'None' : courseOffering.video
            }
            onChange={handleVideoSelection}
            defaultValue={translatedNoneOption}
          />
        </div>
        {thumbnail && <img src={thumbnail} alt="" style={styles.image} />}
      </label>
      <label>
        CS Topic
        <HelpTip>
          <p>
            Select all related CS topics. Shift-click or cmd-click to select
            multiple.
          </p>
        </HelpTip>
        <select
          multiple
          value={courseOffering.cs_topic?.split(',')}
          style={styles.dropdown}
          onChange={e => handleMultipleSelected(e, 'cs_topic')}
        >
          <option value="">{translatedNoneOption}</option>
          {CourseOfferingCsTopics.map(topic => (
            <option key={topic} value={topic}>
              {translatedCourseOfferingCsTopics[topic]}
            </option>
          ))}
        </select>
      </label>
      <label>
        School Subject
        <HelpTip>
          <p>
            Select all related school subjects. Shift-click or cmd-click to
            select multiple.
          </p>
        </HelpTip>
        <select
          multiple
          value={courseOffering.school_subject?.split(',')}
          style={styles.dropdown}
          onChange={e => handleMultipleSelected(e, 'school_subject')}
        >
          <option value="">{translatedNoneOption}</option>
          {CourseOfferingSchoolSubjects.map(subject => (
            <option key={subject} value={subject}>
              {translatedCourseOfferingSchoolSubjects[subject]}
            </option>
          ))}
        </select>
      </label>
      <h3>Device Compatibility</h3>
      {DeviceTypes.map(device => (
        <label key={device}>
          {translatedCourseOfferingDeviceTypes[device]}
          <select
            value={getDeviceCompatibility(device)}
            style={styles.dropdown}
            onChange={e => updateDeviceCompatibilities(device, e.target.value)}
          >
            <option value="">{translatedNoneOption}</option>
            {DeviceCompatibilityLevels.map(compLevel => (
              <option key={compLevel} value={compLevel}>
                {translatedCourseOfferingDeviceCompatibilityLevels[compLevel]}
              </option>
            ))}
          </select>
        </label>
      ))}
      <h3>Professional Learning</h3>
      <label>
        Professional Learning Program
        <HelpTip>
          <p>
            Select a workshop where one can learn more about the professional
            learning program
          </p>
        </HelpTip>
        <select
          value={courseOffering.professional_learning_program}
          style={styles.dropdown}
          onChange={e =>
            updateCourseOffering(
              'professional_learning_program',
              e.target.value
            )
          }
        >
          <option value="">{translatedNoneOption}</option>
          {Object.entries(props.professionalLearningProgramPaths).map(
            ([key, path]) => (
              <option key={key} value={path}>
                {key}
              </option>
            )
          )}
        </select>
      </label>
      <label>
        Self-Paced Professional Learning
        <HelpTip>
          <p>
            Pick the self-paced course offering that supports teachers teaching
            the course offering.
          </p>
        </HelpTip>
        <select
          value={courseOffering.self_paced_pl_course_offering_id}
          style={styles.dropdown}
          onChange={e => {
            updateCourseOffering(
              'self_paced_pl_course_offering_id',
              e.target.value
            );
          }}
        >
          <option value="">{translatedNoneOption}</option>
          {Object.values(props.selfPacedPLCourseOfferings).map(co => (
            <option key={co.id} value={co.id}>
              {`${co.display_name}: ${co.key}`}
            </option>
          ))}
        </select>
      </label>
      <label>
        <div style={styles.flexContainer}>
          <h3>Published Date </h3>
          <HelpTip>
            <p>Select the Published Date of the course offering</p>
          </HelpTip>
        </div>
        <DatePicker date={selectedDate} onChange={handleDateChange} clearable />
      </label>
      <SaveBar
        handleSave={handleSave}
        error={error}
        isSaving={isSaving}
        lastSaved={lastSaved}
        pathForShowButton={'/'}
      />
    </div>
  );
}

CourseOfferingEditor.propTypes = {
  initialCourseOffering: PropTypes.shape({
    key: PropTypes.string,
    is_featured: PropTypes.bool,
    display_name: PropTypes.string,
    assignable: PropTypes.bool,
    grade_levels: PropTypes.string,
    curriculum_type: PropTypes.string,
    header: PropTypes.string,
    marketing_initiative: PropTypes.string,
    image: PropTypes.string,
    cs_topic: PropTypes.string,
    school_subject: PropTypes.string,
    device_compatibility: PropTypes.string,
    description: PropTypes.string,
    professional_learning_program: PropTypes.string,
    self_paced_pl_course_offering_id: PropTypes.number,
    video: PropTypes.string,
    published_date: PropTypes.string,
  }),
  selfPacedPLCourseOfferings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      key: PropTypes.string,
      display_name: PropTypes.string,
    })
  ),
  professionalLearningProgramPaths: PropTypes.objectOf(PropTypes.string),
  videos: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      youtube_url: PropTypes.string,
      thumbnail: PropTypes.string,
      locale: PropTypes.string,
    })
  ),
};

const styles = {
  checkbox: {
    margin: '0 0 0 7px',
  },
  descriptionInput: {
    width: '75%',
    height: '75px',
  },
  dropdown: {
    margin: '0 6px',
  },
  dropdownLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '10px',
    cursor: 'pointer',
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    width: 100,
    marginLeft: 5,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0,
  },
  label: {
    paddingLeft: 4,
  },
};
