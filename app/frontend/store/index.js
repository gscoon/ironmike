import Reflux from 'reflux';

class AppStore extends Reflux.Store
{
    constructor(){
        super();
        this.state = {
            hasLoaded       : false,
            latestReq       : null,
            tunnelStatus    : false,
            app             : I.fromJS({
                servers         : [],
                requests        : []
            })
        }; // <- set store's default state much like in React

        this.apiHost = Handler.api.getHost();

        this.listenables = [
            Actions.dashboard,
            Actions.start,
            Actions.settings,
        ];
    }

    getEndpoint(url){
        return this.apiHost + url;
    }

    onGetServers(){
        var url = this.getEndpoint('/api/servers');
        Util.get(url)
        .then((response)=>{
            if(!response.status)
                return;

            var serverList = I.fromJS(response.servers);
            var newApp = this.state.app.set('servers', serverList);
            this.setState({app: newApp});
        })
    }

    onGetLatestRequest(){
        var latest = this.state.latestReq || this.parseLatestRequest();
        if(!latest) return;

        var url = this.getEndpoint('/api/requests/' + latest.id);
        Util.get(url)
        .then((res)=>{
            Modal.hideLoader();
            if(!res.status || !res.data.length)
                return;

            console.log("New data", res.data.length);
            var newList = I.fromJS(res.data);
            var newApp = this.state.app.updateIn(['requests'], (oldList)=>{
                return newList.concat(oldList);
            })

            this.setState({app: newApp});
            Toast.info("New requests", {
                position: Toast.POSITION.BOTTOM_RIGHT
            });
            this.parseLatestRequest();
        })
        // var latest = this.parseLatestRequest();
        // console.log('Getting latest request', latest);
    }

    onGetRequests(){
        Modal.showLoader();
        var url = this.getEndpoint('/api/requests');

        var requestList = Handler.data.get('requests');
        requestList = _.orderBy(requestList, ['unixTimestamp'], ['desc']);

        Util.get(url)
        .then((res)=>{
            Modal.hideLoader();
            if(!res.status)
                return;

            var requestList = I.fromJS(res.data);
            var newApp = this.state.app.set('requests', requestList);
            console.log('Setting requests');
            this.setState({app: newApp});
            this.parseLatestRequest();
        })
        .catch(()=>{
            Modal.hideLoader();
        })
    }

    onDeleteRequest(id){
        Modal.showLoader();
        var url = this.getEndpoint('/api/requests');
        Util.del(url, {requests: [id]})
        .then((res)=>{
            var newApp = this.state.app.updateIn(['requests'], (requests)=>{
                return requests.filter((item)=>{
                    return item.get('id') !== id;
                })
            });

            this.setState({app: newApp});

            Toast.info("Removed");
            Modal.hideLoader();
        })
        .catch(()=>{
            Toast.error("An error occurred.");
            Modal.hideLoader();
        })
    }

    onCheckTunnel(data){
        var url = '/api/tunnel/check';
        Util.post(url, data)
        .then((response)=>{
            console.log("tunnel", response);
            if(!response.status)
                return sendError();

            Toast.success("Connection successful.");
        })
        .catch(sendError)

        function sendError(){
            Toast.error("An error occurred.");
        }
    }

    parseLatestRequest(){
        var latest = null;

        var reqList = this.state.app.get('requests');
        reqList.forEach((r)=>{
            if(!latest)
                return latest = this.formatLatest(r);

            if(r.get('unixTimestamp') > latest.timestamp)
                return latest = this.formatLatest(r);
        })

        this.setState({latestReq: latest});
        return latest;
    }

    formatLatest(r){
        return {id: r.get('id'), timestamp: r.get('unixTimestamp')};
    }
}

module.exports = AppStore;
