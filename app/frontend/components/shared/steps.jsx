import React, {Component} from 'react';
var Step = UI.Step;

class Steps extends Component {
    render(){
        return (
            <Step.Group ordered id="start_view_steps">
                <Step active>
                    <Step.Content>
                        <Step.Title>Remote Server</Step.Title>
                        <Step.Description>Setup your SSH settings</Step.Description>
                    </Step.Content>
                </Step>
                <Step>
                    <Step.Content>
                        <Step.Title>Tunnel Setting</Step.Title>
                        <Step.Description>Set your tunnel options</Step.Description>
                    </Step.Content>
                </Step>
                <Step>
                    <Step.Content>
                        <Step.Title>Track Requests</Step.Title>
                        <Step.Description>Track HTTP requests</Step.Description>
                    </Step.Content>
                </Step>
            </Step.Group>
        );
    }
}

module.exports = Steps;
