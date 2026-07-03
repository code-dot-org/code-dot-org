import defaultExport, {TeacherDashboardHome} from '../index';

it('exports TeacherDashboardHome as both named and default export', () => {
  expect(TeacherDashboardHome).toBeTypeOf('function');
  // The Studio route lazy-imports the default export.
  expect(defaultExport).toBe(TeacherDashboardHome);
});
