import React, {Component} from 'react';
import ReactJson from 'react-json-view'

class Dashboard extends Component {
    constructor(props){
        super(props);
        Util.wait().then(Actions.dashboard.getRequests);

        Util.waitasec(1)
        .then(()=>{
            setInterval(Actions.dashboard.getLatestRequest, 5000);
        })
    }

    render(){
        var requests = this.props.requests.toJS();

        var rows = requests.map((r, index)=>{
            return <RequestRow request={r} num={index+1} key={r.id} />
        });

        return (
            <div id="request_list">
                <div id="request_list_header" className="row">
                    <div className="col-sm-1">#</div>
                    <div className="col-sm-2">Details</div>
                    <div className="col-sm-1">Method</div>
                    <div className="col-sm-2">Path</div>
                    <div className="col-sm-2">Host</div>
                    <div className="col-sm-2">Time Since</div>
                    <div className="col-sm-1">ID</div>
                    <div className="col-sm-1">Delete</div>
                </div>
                {rows}
            </div>
        )
    }
}

class RequestRow extends Component {
    constructor(props){
        super(props);
        this.state = {
            counter     : 0,
            showLower   : false,
        };

        // ever 10 seconds
        var obj = Util.interval(10 * 1000, ()=>{
            this.setState({counter: this.state.counter + 1})
        });

    }

    handleDelete(){
        Modal.confirm('Are you sure you want to delete?')
        .then(()=>{
            Actions.dashboard.deleteRequest(this.props.request.id);
        })
    }

    toggleDetails(){
        this.setState({showLower: !this.state.showLower});
    }

    render(){
        var r = this.props.request;
        var ts = r.timestmap || r.timestamp;
        var formattedTime = moment(ts).format('YYYY-MM-DD h:mm:ss a');
        var timeSince = moment(ts).fromNow();
        r.body = r.body || {};
        var id = r.id.slice(-5);

        var lowerStyle = {display: this.state.showLower ? 'block': 'none'};
        var updown = "chevron " + (this.state.showLower ? 'up' : 'down');
        return (
            <div className="request_list_row">
                <div className="request_list_row_upper row">
                    <div className="col-sm-1">{this.props.num}.</div>
                    <div className="col-sm-2">
                        <UI.Button size="tiny" content="Details" color="blue" icon={updown} onClick={this.toggleDetails.bind(this)} />
                    </div>
                    <div className="col-sm-1">{r.method}</div>
                    <div className="col-sm-2">{r.path}</div>
                    <div className="col-sm-2">{r.hostname}</div>
                    <div className="col-sm-2">{timeSince}</div>
                    <div className="col-sm-1">{id}</div>

                    <div className="col-sm-1">
                        <UI.Button size="tiny" icon="trash" onClick={this.handleDelete.bind(this)} />
                    </div>
                </div>
                <div className="request_list_row_lower" style={lowerStyle}>
                    <div className="row">
                        <div className="col-sm-6">
                            <PropertiesSection title="Headers" properties={r.headers} />
                        </div>
                        <div className="col-sm-6">
                            <PropertiesSection title="Query" properties={r.query} />
                        </div>
                    </div>
                    <PropertiesSection title="Body" json={r.body} />
                </div>
            </div>
        )
    }
}

class PropertiesSection extends Component {
    constructor(props){
        super(props);

    }

    getPropertyRow(key, val){
        return (
            <div className="property_row">
                <span className="property_key">{key}:</span>
                <span className="property_val">{val}</span>
            </div>
        )
    }

    render(){
        var inner = null;
        if(this.props.properties){
            var properties = this.props.properties || {};
            inner = Object.keys(properties).map((k)=>{
                return this.getPropertyRow(k, properties[k]);
            });
        }
        else if(this.props.json){
            inner = <ReactJson src={this.props.json} name={null} collapsed={1} displayDataTypes={false} />;
        }

        return (
            <div className="property_section">
                <div className="property_section_title">{this.props.title}:</div>
                <div className="property_section_inner">
                    {inner}
                </div>
            </div>
        )
    }
}

module.exports = Dashboard;
