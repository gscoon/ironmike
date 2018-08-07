import React, {Component} from 'react';

class Start extends Component {
    constructor(props){
        super(props);

        this.state = {
            host        : null,
            authType    : 'password',
        }

        this.authOptions = [
            { key: 'pwd', text: 'Password', value: 'password' },
            { key: 'ppk', text: 'Private Key', value: 'key' },
        ];

        Util.wait().then(Actions.start.getServers);
    }

    handleHostChange(evt, data){
        console.log(data);
        this.setState({host: data.value})
    }

    getCustomForm(){
        return (
            <div>
                <UI.Divider clearing />
                <UI.Form.Group>
                    <UI.Form.Input fluid label='Host' placeholder='Host' width={12} />
                    <UI.Form.Input fluid label='Port' placeholder='Port' width={4} />
                </UI.Form.Group>
                <UI.Form.Group widths='equal'>
                    <UI.Form.Input fluid label='Username' placeholder='Username' />
                    <UI.Form.Select fluid label='Auth Type' placeholder='Auth Type' options={this.authOptions} />
                    <UI.Form.Input fluid label='Password' placeholder='Password' />
                </UI.Form.Group>
                <UI.Divider clearing />
                <UI.Button type='submit' content="Submit" />
            </div>
        )
    }

    render(){
        var hostOptions = [{
            text : 'Custom Host',
            value : '==custom==',
        }];

        var servers = this.props.servers || [];
        servers.forEach((s)=>{
            hostOptions.push({text: s.Host, value: s.Host})
        })

        console.log("current host", this.state.host);
        var bottom = null;

        if(this.state.host === '==custom==')
            bottom = this.getCustomForm();

        // <UI.Message warning visible={true} header="SSH Setup" content="Provide your ssh details below:" />
        return (
            <div id="start_view">
                <UI.Container>
                    <UI.Header as='h2' content='Setup your remote server' subheader='Setup your SSH settings'/>
                    <UI.Form>
                        <UI.Form.Select fluid label='Host Options:' placeholder='Hosts' options={hostOptions} onChange={this.handleHostChange.bind(this)} />
                        {bottom}
                    </UI.Form>
                </UI.Container>
            </div>
        );
    }
}

module.exports = Start;
