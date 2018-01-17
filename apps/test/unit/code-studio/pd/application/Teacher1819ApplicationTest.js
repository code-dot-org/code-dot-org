import React from 'react';
import {expect} from 'chai';
import Section4SummerWorkshop from '@cdo/apps/code-studio/pd/application/teacher1819/Section4SummerWorkshop';
import {PROGRAM_CSD, PROGRAM_CSP} from '@cdo/apps/code-studio/pd/application/teacher1819/TeacherApplicationConstants';
import {TextFields} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';

const options = {
  committed: [
    'Yes',
    'No (please explain):'
  ],
  willingToTravel: [
    'Less than 10 miles',
    '10 to 25 miles',
    '25 to 50 miles',
    'More than 50 miles'
  ],
  payFee: [
    'Yes, my school or I will be able to pay the full summer workshop program fee.',
    'No, my school or I will not be able to pay the summer workshop program fee.',
    'Not applicable: there is no fee for the summer workshop for teachers in my region.'
  ]
};

const ABLE_TO_ATTEND_SINGLE = "Yes, I'm able to attend";

const assignedWorkshops = [
  {id: 101, dates: 'January 15-19, 2018', location: 'Seattle, WA'},
  {id: 102, dates: 'January 22-26, 2018', location: 'Seattle, WA'}
];

const alternateWorkshops = [
  {id: 201, dates: 'February 5-9, 2018', location: 'Seattle, WA'},
  {id: 202, dates: 'February 12-16, 2018', location: 'Seattle, WA'}
];

const alternateWorkshopsWithPartnerName = alternateWorkshops.map(w => ({...w, partnerName: 'Other Partner'}));

const exampleTeachercon = {city: 'Atlanta', dates: 'June 17 - 22, 2018'};

describe("Section4SummerWorkshop", () => {
  let sandbox;
  let handleChange;
  beforeEach(() => {
    sandbox = sinon.createSandbox({useFakeServer: true});
    handleChange = sandbox.spy();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("On mount", () => {
    let server;
    let setServerResponse;
    let mountSection4SummerWorkshopWithData;
    beforeEach(() => {
      server = sandbox.server.create();
      setServerResponse = (url, data) => server.respondWith(
        "GET",
        url,
        [
          200,
          { "Content-Type": "application/json" },
          JSON.stringify(data)
        ]
      );
    });

    mountSection4SummerWorkshopWithData = (data) => mount(
      <Section4SummerWorkshop
        options={options}
        errors={[]}
        errorMessages={{}}
        data={data}
        onChange={handleChange}
      />
    );

    it("Initially loads partner workshops based on school id", () => {
      mountSection4SummerWorkshopWithData({
        program: PROGRAM_CSD,
        school: '12345'
      });

      expect(server.requests).to.have.length(1);
      expect(server.requests[0].url).to.eql(
        "/api/v1/pd/regional_partner_workshops/find?course=CS+Discoveries&subject=5-day+Summer&school=12345"
      );
    });

    it("Initially loads partner workshops based on school zip and state", () => {
      mountSection4SummerWorkshopWithData({
        program: PROGRAM_CSP,
        school: '-1',
        schoolZipCode: 98101,
        schoolState: 'WA'
      });

      expect(server.requests).to.have.length(1);
      expect(server.requests[0].url).to.eql(
        "/api/v1/pd/regional_partner_workshops/find?course=CS+Principles&subject=5-day+Summer&zip_code=98101&state=WA"
      );
    });

    it("Sets partner workshop data and state based on API response", () => {
      const section4 = mountSection4SummerWorkshopWithData({
        program: PROGRAM_CSD,
        school: '12345'
      });

      expect(section4.state().loadingPartner).to.be.true;
      expect(server.requests).to.have.length(1);
      setServerResponse(
        "/api/v1/pd/regional_partner_workshops/find?course=CS+Discoveries&subject=5-day+Summer&school=12345",
        {
          id: 99,
          group: 2,
          workshops: assignedWorkshops,
          teachercon: null
        }
      );
      server.respond();

      expect(handleChange).to.have.been.calledWith({
        regionalPartnerId: 99,
        regionalPartnerGroup: 2,
        regionalPartnerWorkshopIds: [101, 102],
        teachercon: null
      });
      expect(section4.state().loadingPartner).to.be.false;
      expect(section4.state().partnerWorkshops).to.eql(assignedWorkshops);
    });

    it("Sets teachercon data and state based on API response for G3 teachercon partners", () => {
      const section4 = mountSection4SummerWorkshopWithData({
        program: PROGRAM_CSD,
        school: '12345'
      });

      expect(section4.state().loadingPartner).to.be.true;
      expect(server.requests).to.have.length(1);
      setServerResponse(
        "/api/v1/pd/regional_partner_workshops/find?course=CS+Discoveries&subject=5-day+Summer&school=12345",
        {
          id: 99,
          group: 3,
          workshops: [],
          teachercon: exampleTeachercon
        }
      );
      server.respond();

      expect(handleChange).to.have.been.calledWith({
        regionalPartnerId: 99,
        regionalPartnerGroup: 3,
        regionalPartnerWorkshopIds: [],
        teachercon: exampleTeachercon
      });
      expect(section4.state().loadingPartner).to.be.false;
      expect(section4.state().partnerWorkshops).to.eql([]);
    });

    describe("With single assigned workshop", () => {
      let mountSection4WithAssignedWorkshop;
      beforeEach(() => {
        mountSection4WithAssignedWorkshop = (additionalData) => mountSection4SummerWorkshopWithData({
          program: PROGRAM_CSD,
          school: '12345',
          regionalPartnerId: 100,
          ...additionalData
        });
      });

      const allWorkshopsData = [{
        id: 100, // Same partner (meaning same single workshop): excluded
        name: 'Assigned Partner',
        workshops: [assignedWorkshops[0]]
      }, {
        id: 101, // Different partner: included
        name: 'Other Partner',
        workshops: alternateWorkshops
      }];

      it("Initially loads alternate workshops when unable to attend", () => {
        const section4 = mountSection4WithAssignedWorkshop({
          ableToAttendSingle: TextFields.unableToAttend
        });

        expect(section4.state().loadingAlternateWorkshops).to.be.true;
        expect(server.requests).to.have.length(2); // Assigned workshop and alternate workshops
        setServerResponse(
          "/api/v1/pd/regional_partner_workshops?course=CS+Discoveries&subject=5-day+Summer",
          allWorkshopsData
        );
        server.respond();

        expect(section4.state().loadingAlternateWorkshops).to.be.false;
        expect(section4.state().alternateWorkshops).to.eql(alternateWorkshopsWithPartnerName);
      });

      it("Does not initially load alternate workshops when able to attend", () => {
        const section4 = mountSection4WithAssignedWorkshop({
          ableToAttendSingle: ABLE_TO_ATTEND_SINGLE
        });
        expect(server.requests).to.have.length(1);
        expect(section4.state().loadingAlternateWorkshops).to.be.false;
        expect(section4.state().alternateWorkshops).to.be.null;
      });

      describe("With no selection made", () => {
        let section4;
        beforeEach(() => {
          section4 = mountSection4WithAssignedWorkshop({
            ableToAttendSingle: undefined
          });

          // ignore the initial assigned workshops call
          expect(server.requests).to.have.length(1);
          server.reset();
        });

        it("Does not initially load alternate workshops", () => {
          expect(server.requests).to.have.length(0);
        });

        it("Loads alternate workshops when no is selected", () => {
          section4.instance().handleChange({ableToAttendSingle: TextFields.unableToAttend});
          expect(section4.state().loadingAlternateWorkshops).to.be.true;
          expect(server.requests).to.have.length(1);
          setServerResponse(
            "/api/v1/pd/regional_partner_workshops?course=CS+Discoveries&subject=5-day+Summer",
            allWorkshopsData
          );
          server.respond();

          expect(section4.state().loadingAlternateWorkshops).to.be.false;
          expect(section4.state().alternateWorkshops).to.eql(alternateWorkshopsWithPartnerName);
        });

        it("Does not load alternate workshops when yes is selected", () => {
          section4.instance().handleChange({ableToAttendSingle: ABLE_TO_ATTEND_SINGLE});
          expect(server.requests).to.have.length(0);
        });
      });
    });

    describe("With multiple assigned workshops", () => {
      let mountSection4WithAssignedWorkshops;
      beforeEach(() => {
        mountSection4WithAssignedWorkshops = (additionalData) => mountSection4SummerWorkshopWithData({
          program: PROGRAM_CSD,
          school: '12345',
          regionalPartnerId: 200,
          ...additionalData
        });
      });

      const allWorkshopsData = [{
        id: 200, // Same partner (meaning same assigned workshops): excluded
        name: 'Assigned Partner',
        workshops: assignedWorkshops
      }, {
        id: 201, // Different partner: included
        name: 'Other Partner',
        workshops: alternateWorkshops
      }];

      it("Initially loads alternate workshops when unable to attend", () => {
        const section4 = mountSection4WithAssignedWorkshops({
          ableToAttendMultiple: [TextFields.noExplain]
        });

        expect(section4.state().loadingAlternateWorkshops).to.be.true;
        expect(server.requests).to.have.length(2); // Assigned workshop and alternate workshops
        setServerResponse(
          "/api/v1/pd/regional_partner_workshops?course=CS+Discoveries&subject=5-day+Summer",
          allWorkshopsData
        );
        server.respond();

        expect(section4.state().loadingAlternateWorkshops).to.be.false;
        expect(section4.state().alternateWorkshops).to.eql(alternateWorkshopsWithPartnerName);
      });

      it("Does not initially load alternate workshops when able to attend", () => {
        const section4 = mountSection4WithAssignedWorkshops({
          ableToAttendMultiple: [assignedWorkshops[0]]
        });
        expect(server.requests).to.have.length(1);
        expect(section4.state().loadingAlternateWorkshops).to.be.false;
        expect(section4.state().alternateWorkshops).to.be.null;
      });

      describe("With no selection made", () => {
        let section4;
        beforeEach(() => {
          section4 = mountSection4WithAssignedWorkshops({
            ableToAttendMultiple: undefined
          });

          // ignore the initial assigned workshops call
          expect(server.requests).to.have.length(1);
          server.reset();
        });

        it("Does not initially load alternate workshops", () => {
          expect(server.requests).to.have.length(0);
        });

        it("Loads alternate workshops when no is selected", () => {
          section4.instance().handleChange({ableToAttendMultiple: [TextFields.noExplain]});
          expect(section4.state().loadingAlternateWorkshops).to.be.true;
          expect(server.requests).to.have.length(1);
          setServerResponse(
            "/api/v1/pd/regional_partner_workshops?course=CS+Discoveries&subject=5-day+Summer",
            allWorkshopsData
          );
          server.respond();

          expect(section4.state().loadingAlternateWorkshops).to.be.false;
          expect(section4.state().alternateWorkshops).to.eql(alternateWorkshopsWithPartnerName);
        });

        it("Does not load alternate workshops when yes is selected", () => {
          section4.instance().handleChange({ableToAttendSingle: "Yes, I'm able to attend"});
          expect(server.requests).to.have.length(0);
        });
      });
    });
  });

  describe("With partner data", () => {
    const wrapSection4SummerWorkshop = ({data, state, wrapMethod = shallow}) => {
      const section4 = wrapMethod(
        <Section4SummerWorkshop
          options={options}
          errors={[]}
          errorMessages={{}}
          data={data}
          onChange={handleChange}
        />
      );

      section4.setState({
        loadingPartner: false,
        ...state
      });

      return section4;
    };

    it("Renders no regional partner in your area message", () => {
      const section4 = wrapSection4SummerWorkshop({
        data: {regionalPartnerId: null}
      });

      expect(section4.find("#assignedWorkshops")).to.contain.text(
        "There currently is no Regional Partner in your area."
      );
    });

    it("Renders teachercon for group 3 with no local workshops", () => {
      const section4 = wrapSection4SummerWorkshop({
        data: {
          regionalPartnerId: 123,
          regionalPartnerGroup: 3,
          regionalPartnerWorkshopIds: [],
          teachercon: exampleTeachercon
        },
        state: {
          teachercon: exampleTeachercon
        }
      });

      expect(section4.find("#assignedWorkshops")).to.contain.text(
        "You have been assigned to TeacherCon Atlanta, June 17 - 22, 2018"
      );
    });

    [1,2,3].forEach(group => {
      it(`Renders yet to be determined message for group ${group} with no local workshops`, () => {
        const section4 = wrapSection4SummerWorkshop({
          data: {
            regionalPartnerId: 123,
            regionalPartnerGroup: 1,
            regionalPartnerWorkshopIds: []
          },
          state: {
            partnerWorkshops: []
          }
        });

        expect(section4.find("#assignedWorkshops")).to.contain.text(
          "Your region’s assigned summer workshop is yet to be determined."
        );
      });

      it(`Renders single local workshop for group ${group}`, () => {
        const section4 = wrapSection4SummerWorkshop({
          data: {
            regionalPartnerId: 123,
            regionalPartnerGroup: group,
            regionalPartnerWorkshopIds: [101]
          },
          state: {
            partnerWorkshops: [assignedWorkshops[0]]
          }
        });

        expect(section4.find("#assignedWorkshops")).to.contain.text(
          "Your region’s assigned summer workshop will be January 15-19, 2018 in Seattle, WA"
        );
      });

      it(`Renders multiple local workshops for group ${group}`, () => {
        const section4 = wrapSection4SummerWorkshop({
          // Mount instead of shallow here because the label text in this case is buried inside the child ButtonList.
          wrapMethod: mount,
          data: {
            regionalPartnerId: 123,
            regionalPartnerGroup: group,
            regionalPartnerWorkshopIds: [101, 102]
          },
          state: {
            partnerWorkshops: assignedWorkshops
          }
        });

        expect(section4.find("#assignedWorkshops")).to.contain.text(
          "Your Regional Partner has more than one local summer workshop in your region."
        );
      });
    });

    it("Renders teachercon for (group 3) partner with teachercon", () => {
      // G3 is assumed, but actually any partner mapped to a teachercon will use that.
      const section4 = wrapSection4SummerWorkshop({
        data: {
          regionalPartnerId: 123,
          regionalPartnerGroup: 3,
          regionalPartnerWorkshopIds: [],
          teachercon: exampleTeachercon
        }
      });

      expect(section4.find("#assignedWorkshops")).to.contain.text(
        "You have been assigned to TeacherCon Atlanta, June 17 - 22, 2018"
      );
    });

    it("Renders alternate workshop checklist when alternate workshop data exists", () => {
      const section4 = wrapSection4SummerWorkshop({
        // Mount instead of shallow here because the label text in this case is buried inside the child ButtonList.
        wrapMethod: mount,
        data: {
          regionalPartnerId: 123,
          regionalPartnerGroup: 1,
          regionalPartnerWorkshopIds: [101],
          ableToAttendSingle: TextFields.unableToAttend
        },
        state: {
          partnerWorkshops: [assignedWorkshops[0]],
          alternateWorkshops: alternateWorkshops,
          loadingAlternateWorkshops: false
        }
      });

      const alternateWorkhopsDiv = section4.find("#alternateWorkshops");
      expect(alternateWorkhopsDiv).to.have.length(1);
      expect(alternateWorkhopsDiv).to.contain.text(
        "which of the following alternate workshops are you available to attend?"
      );
    });
  });
});
