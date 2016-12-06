/**
 * Day Name Component
 */
import React from 'react';
import moment from 'moment';

import forEach from 'lodash.foreach';

// import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

import Session from '../../middleware/Session';

import { fromJS } from 'immutable';

import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin';
import createStickerPlugin from 'draft-js-sticker-plugin';
import timeSuggestions from './timeSuggestions';

import stickers from './stickers';


export default class DayEventsList extends React.Component {

		constructor(props) {
				let user =  Session.getSession('prg_lg');
        super(props);
        this.state = {
						user : user,
						editorState : EditorState.createEmpty(),
				};
    }

    render() {
        let _this = this;
        let  items = this.props.events.map(function(event,key){

            if(event.type == 2) {
                return;
            }


            const stickerPlugin = createStickerPlugin({
                stickers: stickers,
                attachRemoveButton : false
            });
            const StickerSelect = stickerPlugin.StickerSelect;
            const mentionPlugin = createMentionPlugin({
                entityMutability: 'IMMUTABLE',
                mentionPrefix: '#',
                mentionTrigger: '#',
                mentionComponent: (props) => (
                    <span data-offset-key={props.entityKey} className={props.className} > {props.decoratedText}</span>
                )
            });

            // plugins for mentioning the time
            const mentionPlugin2 = createMentionPlugin({
                timeSuggestions,
                entityMutability: 'IMMUTABLE',
                mentionPrefix: '@'
            });

            const emojiPlugin = createEmojiPlugin();
            const plugins = [stickerPlugin, mentionPlugin, emojiPlugin, mentionPlugin2];



            let rawDescription = event.description;
            if(rawDescription.hasOwnProperty("entityMap") == false){
                rawDescription.entityMap = [];
            }

            // let contentState = convertFromRaw(event.description);
            // let htmlC = stateToHTML(contentState);
						console.log(contentState);
						console.log(_this.state.editorState);


						var rawContent = event.description;
						forEach(rawContent.entityMap, function(value, key) {
						  	value.data.mention = fromJS(value.data.mention)
						})

            const contentState = convertFromRaw(rawContent);
						const newEditorState = EditorState.createWithContent(contentState);

						let usersString = [];
						let acceptedClass = 'event-description';

						if(event.shared_users.length > 0 ) {
								usersString = event.shared_users.map(function(user,userKey){
										if(event.user_id ==  _this.state.user.id || (user.shared_status == 3 &&_this.state.user.id == user.id )) {
												acceptedClass = 'event-description accepted';
										}

		                return <span className={user.shared_status == 3 ? 'selected-people' : 'people-list'} key={userKey}>{user.name}, </span>
		            });
						} else {
								usersString = <span className="people-list">Only me</span>
						}

            return (
                <li key={key}>
                    <i className="fa fa-circle" aria-hidden="true"></i>
                    <div>
												<div>
														<Editor
																editorState={newEditorState}
																plugins={plugins}
                                ref={(element) => { this.editor = element; }}
														/>
												</div>
                        <div className="people-list-wrapper">
                            <span className="people-list">People on this event : </span>
                            {usersString}
                        </div>
                    </div>
                    <span className="event-time pull-right">{event.event_time}</span>
										{event.user_id == _this.state.user.id ?
												<i onClick={_this.props.clickEdit.bind(_this, event._id)} className="fa fa-pencil pull-right edit-icon" aria-hidden="true"></i>
												: ''
										}
                </li>
            );
        });

        return(
            <ul className="list-unstyled events-list-area-content-list">
                {items}
            </ul>
        )
    }
}
