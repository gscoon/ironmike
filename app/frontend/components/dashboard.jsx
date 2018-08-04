import React, {Component} from 'react';

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
            return <RequestRow request={r} num={index+1} key={index} />
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
    }

    handleDelete(){
        Modal.confirm('Are you sure you want to delete?')
        .then(()=>{
            Actions.dashboard.deleteRequest(this.props.request.id);
        })
    }

    showMore(){

    }

    render(){
        var r = this.props.request;
        var ts = r.timestmap || r.timestamp;
        var formattedTime = moment(ts).format('YYYY-MM-DD h:mm:ss a');
        var timeSince = moment(ts).fromNow();
        var id = r.id.slice(-5);
        return (
            <div className="request_list_row">
                <div className="request_list_row_upper row">
                    <div className="col-sm-1">{this.props.num}.</div>
                    <div className="col-sm-2">
                        <UI.Button size="tiny" content="Details" color="blue" icon="chevron down" onClick={this.showMore.bind(this)} />
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
                <div className="request_list_row_lower">
                    <div className="sub_container">
                        <div className="request_list_subheader">Headers</div>
                    </div>
                    <div className="sub_container">
                        <div className="request_list_subheader">Body</div>
                    </div>
                </div>
            </div>
        )
    }
}

class HeaderRow extends Component {

    render(){
        return (
            <div class="row"></div>
        )
    }
}

module.exports = Dashboard;
