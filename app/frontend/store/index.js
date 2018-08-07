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

        this.listenables = [
            Actions.dashboard,
            Actions.start,
            Actions.settings,
        ];
    }

    onAddRequestRow(data){

    }

    onGetLatestRequest(){
        var latest = this.state.latestReq || this.parseLatestRequest();
        if(!latest) return;

        var url = '/api/requests/' + latest.id;
        Util.fetch(url)
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
        var url = '/api/requests';
        Util.fetch(url)
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

        Util.del('/api/requests',{requests: [id]})
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

    onGetServers(){
        var url = '/api/servers';
        Util.fetch(url)
        .then((response)=>{
            if(!response.status)
                return;

            var serverList = I.fromJS(response.servers);
            var newApp = this.state.app.set('servers', serverList);
            this.setState({app: newApp});
        })
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
