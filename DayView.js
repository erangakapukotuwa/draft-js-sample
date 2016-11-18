/**
 * Day view of the calender
 */
import React, { Component } from 'react';
import moment from 'moment-timezone';
import Session from '../../middleware/Session';
import EditorField from './EditorField';

import { Popover, OverlayTrigger } from 'react-bootstrap';
import {convertFromRaw, convertToRaw} from 'draft-js';
import { fromJS } from 'immutable';
import forEach from 'lodash.foreach';

export default class DayView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events : [],
        };
    }

    addEvent(event) {

        const Editor = this.refs.EditorFieldValues.state.editorState;
        const contentState = this.refs.EditorFieldValues.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        
        // get shared users from SharedUsers field
        const sharedUsers = [];
        const postData = {
            description : editorContentRaw,
            type : this.state.defaultType,
            apply_date : moment(this.state.currentDay).format('MM DD YYYY HH:mm'),
            event_time : this.state.defaultEventTime,
            event_timezone : moment.tz.guess(),
            shared_users : sharedUsers,
        };
        
        $.ajax({
            url: '/calendar/event/add',
            method: "POST",
            dataType: "JSON",
            data: postData,
        }).done(function (data, text) {
        
            if(data.status.code == 200){
                
            }
        }.bind(this));
    }
    
    clickEdit(eventId) {
        $.ajax({
            url : '/calendar/event/get',
            method : "POST",
            data : { eventId : eventId },
            dataType : "JSON",
            headers : { "prg-auth-header" : this.state.user.token },
            success : function (data, text) {
                if (data.status.code == 200) {
                    var rawContent = data.event.description;
                    forEach(rawContent.entityMap, function(value, key) {
                        value.data.mention = fromJS(value.data.mention)
                    });

                    const contentState = convertFromRaw(rawContent);
                    const editorState = EditorState.createWithContent(contentState);
                    this.refs.EditorFieldValues.setState({editorState : editorState});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }

    render() {
        var eventId = "12345676";
        return (              
            <div className="col-sm-12">
                <div className="input" id="editor-holder" >
                    <EditorField ref="EditorFieldValues" />
                </div>
                <div clickEdit={this.clickEdit.bind(this, eventId)}>Edit</div>
                />
            </div>                                     
        );
    }
}
