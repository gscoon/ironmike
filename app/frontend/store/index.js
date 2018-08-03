import Reflux from 'reflux';
const I = require('immutable');

class AppStore extends Reflux.Store
{
    constructor(){
        super();
        this.state = {
            app: I.fromJS({
                requests: []
            })
        }; // <- set store's default state much like in React

        this.listenables = [
            Actions.dashboard,
            Actions.settings
        ];
    }

    onAddRequestRow(data){

    }

    onDeleteRequest(id){
        console.log('Deleting request', id);
        var newApp = this.state.app.updateIn(['requests'], (requests)=>{
            return requests.filter((item)=>{
                return item.get('id') !== id;
            })
        });
        this.setState({app: newApp});
        Util.del('/api/requests',{requests: [id]});
    }

    onGetRequests(){
        Util.fetch('/api/requests')
        .then((res)=>{
            if(!res.status)
                return;

            var data = I.fromJS(res.data);
            var newApp = this.state.app.set('requests', data);
            console.log('Setting requests');
            this.setState({app: newApp});
        })
    }
}

module.exports = AppStore;
