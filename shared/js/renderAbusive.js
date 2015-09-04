/* global dashboard, React */

module.exports = function () {
  React.render(React.createElement(window.dashboard.AbuseBox, {
    i18n: {
      tos: window.dashboard.i18n.t('project.abuse.tos'),
      contact_us: window.dashboard.i18n.t('project.abuse.contact_us'),
      edit_project: window.dashboard.i18n.t('project.edit_project'),
      go_to_code_studio: window.dashboard.i18n.t('project.abuse.go_to_code_studio')
    },
    isOwner: dashboard.project.isOwner()
  }), document.getElementById('codeApp'));
};
