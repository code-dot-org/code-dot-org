import React from 'react';
import {expect} from 'chai';
import sinon from 'sinon';
import {isolateComponent} from 'isolate-react';
import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';

describe('TeacherApplication', () => {
  const defaultProps = {
    apiEndpoint: '/path/to/endpoint',
    options: {},
    accountEmail: 'user@email.com',
  };

  describe('getInitialData', () => {
    const savedFormData =
      '{' +
      '"firstName": "Brilliant", ' +
      '"previousPd": ["CS Principles","CS Discoveries"]' +
      '}';
    const parsedData = JSON.parse(savedFormData);
    const schoolId = '5';
    const teacherApplication = isolateComponent(
      <TeacherApplication {...defaultProps} />
    );

    it('has no initial data if there is nothing in session storage, no school id, and no form data', () => {
      expect(
        teacherApplication.findOne('FormController').props.getInitialData()
      ).to.deep.equal({});
    });
    it('has saved form data if nothing in session storage and no school id', () => {
      teacherApplication.mergeProps({savedFormData});
      expect(
        teacherApplication.findOne('FormController').props.getInitialData()
      ).to.deep.equal(parsedData);
    });
    it('has saved form data and school id if nothing in session storage', () => {
      teacherApplication.mergeProps({savedFormData, schoolId});
      expect(
        teacherApplication.findOne('FormController').props.getInitialData()
      ).to.deep.equal({
        ...parsedData,
        school: schoolId,
      });
    });
    it('overwrites existing school id if the saved form data has school id', () => {
      teacherApplication.mergeProps({
        savedFormData: `{"school": "16"}`,
        schoolId,
      });
      expect(
        teacherApplication.findOne('FormController').props.getInitialData()
      ).to.deep.equal({school: '16'});
    });
    it('has only saved form data and no school id if session storage has school info', () => {
      sinon
        .stub(window.sessionStorage, 'getItem')
        .withArgs('TeacherApplication')
        .returns(JSON.stringify({data: {school: '25'}}));
      teacherApplication.mergeProps({savedFormData, schoolId});
      expect(
        teacherApplication.findOne('FormController').props.getInitialData()
      ).to.deep.equal(parsedData);
      window.sessionStorage.getItem.restore();
    });
    it('includes saved form data even if partial saving is not allowed', () => {
      teacherApplication.mergeProps({
        savedFormData,
        schoolId,
        allowPartialSaving: false,
      });
      expect(
        teacherApplication.findOne('FormController').props.getInitialData()
      ).to.deep.equal({
        ...parsedData,
        school: schoolId,
      });
    });
  });
});
