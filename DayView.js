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
            defaultType : 'EVENT',
        };
    }
    
    _onHashClick() {
        let showUserPanel = this.state.showUserPanel;
        this.setState({showUserPanel : (showUserPanel == 'active' ? '' : 'active') });
    }

    _onAtClick() {
        let showTimePanel = this.state.showTimePanel;
        this.setState({showTimePanel : (showTimePanel == 'active' ? '' : 'active') });
    }

    componentDidMount() {
        this.loadEvents();
    }

    addEvent(event) {

        const Editor = this.refs.EditorFieldValues.state.editorState;
        const contentState = this.refs.EditorFieldValues.state.editorState.getCurrentContent();
        const editorContentRaw = convertToRaw(contentState);
        
        //  TRIED THIS ONE TOO. dID NOT WORKED
        // forEach(editorContentRaw.entityMap, function(value, key) {
        //    if(value.type == '#mention') {
        //        value.data.mention = fromJS(value.data.mention);
        //    }
        //});

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
                this.refs.SharedUserField.setState({editorState : EditorState.createEmpty()});
                this.loadEvents();
            }
        }.bind(this));
    }

    _onBoldClick() {
        this.refs.EditorFieldValues.onChange(RichUtils.toggleInlineStyle(this.refs.EditorFieldValues.state.editorState, 'BOLD'));
    }

    _onItalicClick() {
        this.refs.EditorFieldValues.onChange(RichUtils.toggleInlineStyle(this.refs.EditorFieldValues.state.editorState, 'ITALIC'));
    }

    _onUnderLineClick() {
        this.refs.EditorFieldValues.onChange(RichUtils.toggleInlineStyle(this.refs.EditorFieldValues.state.editorState, 'UNDERLINE'));
    }

    render() {
        return (              
            <div className="col-sm-12">
                <div className="input" id="editor-holder" >
                    <EditorField ref="EditorFieldValues" />
                </div>
                <div className="items-wrapper">
                    <div className="menu-ico">
                        <p><i className="fa fa-smile-o" aria-hidden="true"></i></p>
                    </div>
                    <div className="menu-ico">
                        <div className="menu-ico">
                            <p>
                                <span className="bold" onClick={this._onBoldClick.bind(this)}>B</span>
                            </p>
                        </div>
                        <div className="menu-ico">
                            <p>
                                <span className="italic" onClick={this._onItalicClick.bind(this)}>I</span>
                            </p>
                        </div>
                        <div className="menu-ico">
                            <p>
                                <span className="underline" onClick={this._onUnderLineClick.bind(this)}>U</span>
                            </p>
                        </div>
                    </div>
                    <div className="btn-enter" onClick={this.addEvent}>
                        <i className="fa fa-paper-plane" aria-hidden="true"></i> Enter
                    </div>
                </div>
            </div>                                     
        );
    }
}
