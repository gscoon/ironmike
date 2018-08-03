import Reflux from 'reflux';

var dashboardActions = Reflux.createActions([
    "addRequestRow",
    "getLatestRequest",
    "getRequests",
    "deleteRequest",
]);

var settingsActions = Reflux.createActions([]);

module.exports = {
    dashboard   : dashboardActions,
    settings    : settingsActions,
}
