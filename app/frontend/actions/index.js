import Reflux from 'reflux';

var dashboardActions = Reflux.createActions([
    "addRequestRow",
    "getLatestRequest",
    "getRequests",
    "deleteRequest",
    "getRequests",
]);

var startActions = Reflux.createActions([
    "getServers",
    "checkTunnel",
]);

var settingsActions = Reflux.createActions([]);

module.exports = {
    dashboard   : dashboardActions,
    settings    : settingsActions,
    start       : startActions,
}
