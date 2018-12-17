import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, withRouter} from 'react-router-dom';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import StatsTable from './StatsTable';

class DebugRouter extends Router {
  constructor(props) {
    super(props);
    console.log('initial history is: ', JSON.stringify(this.history, null,2));
    this.history.listen((location, action)=>{
      console.log(
        `The current URL is ${location.pathname}${location.search}${location.hash}`
      );
      console.log(`The last navigation action was ${action}`, JSON.stringify(this.history, null,2));
    });
  }
}


export default class TeacherDashboard extends Component {
  render() {
    const section = {
      id: 1,
      students: [
        {
          id: 1,
          name: 'Student B',
          total_lines: 1
        },
        {
          id: 2,
          name: 'Student C',
          total_lines: 2
        },
        {
          id: 3,
          name: 'Student A',
          total_lines: 3
        },
      ]
    };

    const studentsCompletedLevelCount = {
      1: 2,
      2: 3,
      3: 1
    };

    return (
      <div>
        <TeacherDashboardNavigation/>
        <DebugRouter>
          <Switch>
            <Route
              exact path="/"
              component={props => <div>Index at /</div>}
            />
            <Route
              path="/teacher_dashboard/sections/:section_id/stats"
              component={withRouter(props => <StatsTable {...props} studentsCompletedLevelCount={studentsCompletedLevelCount}section={section}/>)}
            />
            <Route
              path="/hello"
              component={props => <div>Hello!</div>}
            />
            <Route component={props => <div>no match :( </div>} />
          </Switch>
        </DebugRouter>
      </div>
    );
  }
}
