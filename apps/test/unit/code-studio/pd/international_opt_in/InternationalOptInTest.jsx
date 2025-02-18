import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import InternationalOptIn from '@cdo/apps/code-studio/pd/international_opt_in/InternationalOptIn';

describe('InternationalOptInTest', () => {
  const defaultProps = {
    options: {
      schoolCountry: ['schoolCountry', 'Colombia'],
      workshopCourse: ['workshopCourse'],
      emailOptIn: ['emailOptIn'],
      legalOptIn: ['legalOptIn'],
      workshopOrganizer: ['workshopOrganizer'],
      colombianSchoolData: {
        department: {
          municipality: {
            city: ['branch'],
          },
        },
      },
    },
    accountEmail: 'test@code.org',
    apiEndpoint: '/api/v1/pd/international_opt_ins',
    labels: {
      firstName: 'First Name',
      firstNamePreferred: 'Preferred First Name',
      lastName: 'Last Name',
      email: 'Email',
      school: 'School',
      schoolCity: 'School City',
      schoolCityDistrict: 'School City/District',
      schoolCountry: 'School Country',
      schoolDepartmentRegion: 'School Department/Region',
      schoolName: 'School Name',
      workshopOrganizer: 'Workshop Organizer',
      workshopCourse: 'Workshop Course',
      emailOptIn:
        'Can we email you about Code.org’s international program, updates to our courses, or other computer science news?',
      legalOptIn:
        'By submitting this form, you are agreeing to allow Code.org to share information on how you use Code.org and the Professional Learning resources with the Code.org International Partner(s) in your country. We will share with these partners your contact information (such as name and email address), the information you provide about your school, which courses/units you are using, and aggregate data about these courses (such as the number of students using each course). We will not share any information about individual students with our partners: all student information will be de-identified and aggregated. Our International Partners and facilitators are contractually obliged to treat this information with the same level of confidentiality as Code.org.',
      colombianSchoolCity: 'School City',
      colombianChileanSchoolDepartment: 'School Department',
      colombianSchoolMunicipality: 'School Municipality',
      colombianChileanSchoolName: 'School Name',
      chileanSchoolCommune: 'School Commune',
      chileanSchoolId: 'School ID',
    },
  };

  describe('Colombian school interface', () => {
    it('requires you to select a country before enabling school name and city inputs', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);
      const inputIds = ['schoolName', 'schoolCity'];

      inputIds.forEach(id => {
        const node = wrapper.find(`input#${id}`);
        expect(node.prop('disabled')).toBe(true);
      });

      wrapper.setState({data: {schoolCountry: 'selected country'}});

      inputIds.forEach(id => {
        const node = wrapper.find(`input#${id}`);
        expect(node.prop('disabled')).toBe(false);
      });
    });

    it('displays school name and city as selects rather than inputs when Colombia is selected', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);

      expect(wrapper.find('input#schoolCity')).toHaveLength(1);
      expect(wrapper.find('input#schoolName')).toHaveLength(1);
      expect(wrapper.find('select#schoolCity')).toHaveLength(0);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({
        data: {schoolCountry: 'someplace other than Colombia'},
      });

      expect(wrapper.find('input#schoolCity')).toHaveLength(1);
      expect(wrapper.find('input#schoolName')).toHaveLength(1);
      expect(wrapper.find('select#schoolCity')).toHaveLength(0);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({data: {schoolCountry: 'Colombia'}});

      expect(wrapper.find('input#schoolCity')).toHaveLength(0);
      expect(wrapper.find('input#schoolName')).toHaveLength(0);
      expect(wrapper.find('select#schoolCity')).toHaveLength(1);
      expect(wrapper.find('select#schoolName')).toHaveLength(1);
    });

    it('displays extra inputs when Colombia is selected', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(0);
      expect(wrapper.find('select#schoolMunicipality')).toHaveLength(0);

      wrapper.setState({
        data: {schoolCountry: 'someplace other than Colombia'},
      });

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(0);
      expect(wrapper.find('select#schoolMunicipality')).toHaveLength(0);

      wrapper.setState({data: {schoolCountry: 'Colombia'}});

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(1);
      expect(wrapper.find('select#schoolMunicipality')).toHaveLength(1);
    });

    it('requires each Colombian school data field be selected in order', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);
      wrapper.setState({data: {schoolCountry: 'Colombia'}});

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        true
      );
      expect(wrapper.find('select#schoolCity').prop('disabled')).toBe(true);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolDepartment: 'department', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        false
      );
      expect(wrapper.find('select#schoolCity').prop('disabled')).toBe(true);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolMunicipality: 'municipality', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        false
      );
      expect(wrapper.find('select#schoolCity').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolCity: 'city', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        false
      );
      expect(wrapper.find('select#schoolCity').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(false);
    });

    it('populates the Colombian school data fields based on earlier selections', () => {
      const expandedColombianSchoolData = {
        'department 1': {
          'municipality 1-1': {
            'city 1-1-1': ['branch 1-1-1-1', 'branch 1-1-1-2'],
            'city 1-1-2': ['branch 1-1-2-1', 'branch 1-1-2-2'],
          },
          'municipality 1-2': {
            'city 1-2-1': ['branch 1-2-1-1', 'branch 1-2-1-2'],
            'city 1-2-2': ['branch 1-2-2-1', 'branch 1-2-2-2'],
          },
        },
        'department 2': {
          'municipality 2-1': {
            'city 2-1-1': ['branch 2-1-1-1', 'branch 2-1-1-2'],
            'city 2-1-2': ['branch 2-1-2-1', 'branch 2-1-2-2'],
          },
          'municipality 2-2': {
            'city 2-2-1': ['branch 2-2-1-1', 'branch 2-2-1-2'],
            'city 2-2-2': ['branch 2-2-2-1', 'branch 2-2-2-2'],
          },
        },
      };
      const props = {
        ...defaultProps,
        options: {
          ...defaultProps.options,
          colombianSchoolData: expandedColombianSchoolData,
        },
      };
      const wrapper = mount(<InternationalOptIn {...props} />);
      wrapper.setState({data: {schoolCountry: 'Colombia'}});

      // initially, only departments are available; everything else is empty
      const departments = wrapper
        .find('select#schoolDepartment')
        .children()
        .map(option => option.prop('value'));
      expect(departments).toEqual([
        '',
        'Not applicable',
        'department 1',
        'department 2',
      ]);
      expect(wrapper.find('select#schoolMunicipality').children()).toHaveLength(
        2
      );
      expect(wrapper.find('select#schoolCity').children()).toHaveLength(2);
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);

      // after selecting a department, municipality becomes available
      wrapper.setState({
        data: {schoolDepartment: 'department 1', ...wrapper.state().data},
      });
      let municipalities = wrapper
        .find('select#schoolMunicipality')
        .children()
        .map(option => option.prop('value'));
      expect(municipalities).toEqual([
        '',
        'Not applicable',
        'municipality 1-1',
        'municipality 1-2',
      ]);

      // selecting a different department will change the municipalities available
      wrapper.setState({
        data: {...wrapper.state().data, schoolDepartment: 'department 2'},
      });
      municipalities = wrapper
        .find('select#schoolMunicipality')
        .children()
        .map(option => option.prop('value'));
      expect(municipalities).toEqual([
        '',
        'Not applicable',
        'municipality 2-1',
        'municipality 2-2',
      ]);

      // likewise, municipality and city selections unlock in turn
      expect(wrapper.find('select#schoolCity').children()).toHaveLength(2);
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);
      wrapper.setState({
        data: {...wrapper.state().data, schoolMunicipality: 'municipality 2-1'},
      });
      expect(wrapper.find('select#schoolCity').children()).toHaveLength(4);
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);
      wrapper.setState({
        data: {...wrapper.state().data, schoolCity: 'city 2-1-1'},
      });
      expect(wrapper.find('select#schoolCity').children()).toHaveLength(4);
      expect(wrapper.find('select#schoolName').children()).toHaveLength(4);
    });
  });

  describe('Chilean school interface', () => {
    it('displays school name and city as selects rather than inputs when Chile is selected', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);

      expect(wrapper.find('input#schoolCity')).toHaveLength(1);
      expect(wrapper.find('input#schoolName')).toHaveLength(1);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({
        data: {schoolCountry: 'someplace other than Chile'},
      });

      expect(wrapper.find('input#schoolCity')).toHaveLength(1);
      expect(wrapper.find('input#schoolName')).toHaveLength(1);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({data: {schoolCountry: 'Chile'}});

      expect(wrapper.find('input#schoolCity')).toHaveLength(0);
      expect(wrapper.find('input#schoolName')).toHaveLength(0);
      expect(wrapper.find('select#schoolName')).toHaveLength(1);
    });

    it('displays extra inputs when Chile is selected', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(0);
      expect(wrapper.find('select#schoolCommune')).toHaveLength(0);
      expect(wrapper.find('select#schoolId')).toHaveLength(0);

      wrapper.setState({
        data: {schoolCountry: 'someplace other than Chile'},
      });

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(0);
      expect(wrapper.find('select#schoolCommune')).toHaveLength(0);
      expect(wrapper.find('select#schoolId')).toHaveLength(0);

      wrapper.setState({data: {schoolCountry: 'Chile'}});

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(1);
      expect(wrapper.find('select#schoolCommune')).toHaveLength(1);
      expect(wrapper.find('select#schoolId')).toHaveLength(1);
    });

    it('requires each Chilean school data field be selected in order', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);
      wrapper.setState({data: {schoolCountry: 'Chile'}});

      expect(wrapper.find('select#schoolCommune').prop('disabled')).toBe(true);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);
      expect(wrapper.find('select#schoolId').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolDepartment: 'department', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolCommune').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);
      expect(wrapper.find('select#schoolId').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolCommune: 'commune', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolCommune').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolId').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolName: 'name', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolCommune').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(false);
      expect(wrapper.find('select#schoolId').prop('disabled')).toBe(false);
    });

    it('populates the Chilean school data fields based on earlier selections', () => {
      const expandedChileanSchoolData = {
        'department 1': {
          'commune 1-1': {
            'name 1-1-1': ['id 1-1-1-1', 'id 1-1-1-2'],
            'name 1-1-2': ['id 1-1-2-1', 'id 1-1-2-2'],
          },
          'commune 1-2': {
            'name 1-2-1': ['id 1-2-1-1', 'id 1-2-1-2'],
            'name 1-2-2': ['id 1-2-2-1', 'id 1-2-2-2'],
          },
        },
        'department 2': {
          'commune 2-1': {
            'name 2-1-1': ['id 2-1-1-1', 'id 2-1-1-2'],
            'name 2-1-2': ['id 2-1-2-1', 'id 2-1-2-2'],
          },
          'commune 2-2': {
            'name 2-2-1': ['id 2-2-1-1', 'id 2-2-1-2'],
            'name 2-2-2': ['id 2-2-2-1', 'id 2-2-2-2'],
          },
        },
      };
      const props = {
        ...defaultProps,
        options: {
          ...defaultProps.options,
          chileanSchoolData: expandedChileanSchoolData,
        },
      };
      const wrapper = mount(<InternationalOptIn {...props} />);
      wrapper.setState({data: {schoolCountry: 'Chile'}});

      // initially, only departments are available; everything else is empty
      const departments = wrapper
        .find('select#schoolDepartment')
        .children()
        .map(option => option.prop('value'));
      expect(departments).toEqual([
        '',
        'Not applicable',
        'department 1',
        'department 2',
      ]);
      expect(wrapper.find('select#schoolCommune').children()).toHaveLength(2);
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);
      expect(wrapper.find('select#schoolId').children()).toHaveLength(2);

      // after selecting a department, municipality becomes available
      wrapper.setState({
        data: {schoolDepartment: 'department 1', ...wrapper.state().data},
      });
      let commune = wrapper
        .find('select#schoolCommune')
        .children()
        .map(option => option.prop('value'));
      expect(commune).toEqual([
        '',
        'Not applicable',
        'commune 1-1',
        'commune 1-2',
      ]);

      // selecting a different department will change the communes available
      wrapper.setState({
        data: {...wrapper.state().data, schoolDepartment: 'department 2'},
      });
      commune = wrapper
        .find('select#schoolCommune')
        .children()
        .map(option => option.prop('value'));
      expect(commune).toEqual([
        '',
        'Not applicable',
        'commune 2-1',
        'commune 2-2',
      ]);

      // likewise, name and id selections unlock in turn
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);
      expect(wrapper.find('select#schoolId').children()).toHaveLength(2);
      wrapper.setState({
        data: {...wrapper.state().data, schoolCommune: 'commune 2-1'},
      });
      expect(wrapper.find('select#schoolName').children()).toHaveLength(4);
      expect(wrapper.find('select#schoolId').children()).toHaveLength(2);
      wrapper.setState({
        data: {...wrapper.state().data, schoolName: 'name 2-1-1'},
      });
      expect(wrapper.find('select#schoolName').children()).toHaveLength(4);
      expect(wrapper.find('select#schoolId').children()).toHaveLength(4);
    });
  });

  describe('Uzbekistan school interface', () => {
    it('displays school name and city as selects rather than inputs when Uzbekistan is selected', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);

      expect(wrapper.find('input#schoolCity')).toHaveLength(1);
      expect(wrapper.find('input#schoolName')).toHaveLength(1);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({
        data: {schoolCountry: 'someplace other than Uzbekistan'},
      });

      expect(wrapper.find('input#schoolCity')).toHaveLength(1);
      expect(wrapper.find('input#schoolName')).toHaveLength(1);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({data: {schoolCountry: 'Uzbekistan'}});

      expect(wrapper.find('input#schoolCity')).toHaveLength(0);
      expect(wrapper.find('input#schoolName')).toHaveLength(0);
      expect(wrapper.find('select#schoolName')).toHaveLength(1);
    });

    it('displays extra inputs when Uzbekistan is selected', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(0);
      expect(wrapper.find('select#schoolMunicipality')).toHaveLength(0);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({
        data: {schoolCountry: 'someplace other than Uzbekistan'},
      });

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(0);
      expect(wrapper.find('select#schoolMunicipality')).toHaveLength(0);
      expect(wrapper.find('select#schoolName')).toHaveLength(0);

      wrapper.setState({data: {schoolCountry: 'Uzbekistan'}});

      expect(wrapper.find('select#schoolDepartment')).toHaveLength(1);
      expect(wrapper.find('select#schoolMunicipality')).toHaveLength(1);
      expect(wrapper.find('select#schoolName')).toHaveLength(1);
    });

    it('requires each Uzbekistan school data field be selected in order', () => {
      const wrapper = mount(<InternationalOptIn {...defaultProps} />);
      wrapper.setState({data: {schoolCountry: 'Uzbekistan'}});

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        true
      );
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolDepartment: 'department', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        false
      );
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(true);

      wrapper.setState({
        data: {schoolMunicipality: 'district', ...wrapper.state().data},
      });

      expect(wrapper.find('select#schoolMunicipality').prop('disabled')).toBe(
        false
      );
      expect(wrapper.find('select#schoolName').prop('disabled')).toBe(false);
    });

    it('populates the Uzbekistan school data fields based on earlier selections', () => {
      const expandedUzbekistanSchoolData = {
        'department 1': {
          'district 1-1': ['name 1-1-1', 'name 1-1-2'],
          'district 1-2': ['name 1-2-1', 'name 1-2-2'],
        },
        'department 2': {
          'district 2-1': ['name 2-1-1', 'name 2-1-2'],
          'district 2-2': ['name 2-2-1', 'name 2-2-2'],
        },
      };
      const props = {
        ...defaultProps,
        options: {
          ...defaultProps.options,
          uzbekistanSchoolData: expandedUzbekistanSchoolData,
        },
      };
      const wrapper = mount(<InternationalOptIn {...props} />);
      wrapper.setState({data: {schoolCountry: 'Uzbekistan'}});

      // initially, only departments are available; everything else is empty
      const departments = wrapper
        .find('select#schoolDepartment')
        .children()
        .map(option => option.prop('value'));
      expect(departments).toEqual([
        '',
        'Not applicable',
        'department 1',
        'department 2',
      ]);
      expect(wrapper.find('select#schoolMunicipality').children()).toHaveLength(
        2
      );
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);

      // after selecting a department, district becomes available
      wrapper.setState({
        data: {schoolDepartment: 'department 1', ...wrapper.state().data},
      });
      let commune = wrapper
        .find('select#schoolMunicipality')
        .children()
        .map(option => option.prop('value'));
      expect(commune).toEqual([
        '',
        'Not applicable',
        'district 1-1',
        'district 1-2',
      ]);

      // selecting a different department will change the districts available
      wrapper.setState({
        data: {...wrapper.state().data, schoolDepartment: 'department 2'},
      });
      commune = wrapper
        .find('select#schoolMunicipality')
        .children()
        .map(option => option.prop('value'));
      expect(commune).toEqual([
        '',
        'Not applicable',
        'district 2-1',
        'district 2-2',
      ]);

      // after selecting a district, school becomes available
      expect(wrapper.find('select#schoolName').children()).toHaveLength(2);
      wrapper.setState({
        data: {...wrapper.state().data, schoolMunicipality: 'district 2-1'},
      });
      expect(wrapper.find('select#schoolName').children()).toHaveLength(4);
    });
  });
});
