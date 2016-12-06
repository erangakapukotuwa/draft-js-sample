/**
 * Day Name Component
 */
import React from 'react';

import forEach from 'lodash.foreach';

// import {convertFromRaw, convertToRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';

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
        	super(props);
        	this.state = {};
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
			return (
				<li key={key}>
					<i className="fa fa-circle" aria-hidden="true"></i>
					<div>
						<div>
							<Editor
								editorState={newEditorState}
								plugins={plugins}
								readOnly="true"
							/>
						</div>
					</div>
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
