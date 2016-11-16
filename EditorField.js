import React, { Component } from 'react';
import Session from '../../middleware/Session';

import {EditorState, RichUtils} from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import createEmojiPlugin from 'draft-js-emoji-plugin';

import {convertFromRaw, convertToRaw} from 'draft-js';
import editorStyles from './editorStyles.css';
import mentions from './mentions';

import { fromJS } from 'immutable';
const mentionPlugin = createMentionPlugin({
    entityMutability: 'IMMUTABLE',
    mentionPrefix: '#',
    mentionTrigger: '#',
    mentionComponent: (props) => (
        <span
            data-offset-key={props.entityKey}
            className={props.className}
        >
            {props.decoratedText}
        </span>
    )
});

const { MentionSuggestions } = mentionPlugin;

const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions } = emojiPlugin;
const plugins = [mentionPlugin, emojiPlugin];

export default class EditorField extends Component {
    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state = {
            user : user,
            suggestions: fromJS([]),
            editorState : EditorState.createEmpty(),
        };

        this.focus = this.focus.bind(this);
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSearchChange = ({ value }) => {
            $.ajax({
                url : '/user/get-user-suggestions/'+value.replace("#", ""),
                method : "GET",
                dataType : "JSON",
                success : function (data, text) {
                    if (data.status.code == 200) {
                        this.setState({ suggestions: defaultSuggestionsFilter(value, fromJS(data.suggested_users))});
                    }
                }.bind(this),
                error: function (request, status, error) {
                    console.log(error);
                }
            });
            this.setState({
                suggestions: defaultSuggestionsFilter(value, this.state.suggestions),
            });
            console.log();
        };
    }

    focus() {
        this.editor.focus();
    }

    onChange(editorState) {
        this.setState({editorState});
    }
    
    handleKeyCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    onAddMention(selected) {
        console.log(selected);
    }

    render() {
        const showSecond = false;
        return (
            <div className={editorStyles.editor} onClick={this.focus}>
                <Editor
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    onChange={this.onChange}
                    plugins={plugins}
                    ref={(element) => { this.editor = element; }}
                    placeholder="Type in an Event or a To-do here use # to tag people, @ to set time of the event"
                    decorators={[{
                        strategy: timeStrategy,
                        component: HandleSpan,
                    },]}
                  />
                <EmojiSuggestions />
                <MentionSuggestions
                    onSearchChange={this.onSearchChange}
                    suggestions={this.state.suggestions}
                    onAddMention={this.onAddMention}
                />
            </div>
        );
    }
}
                                
const HANDLE_REGEX = /\$[\w]+/g;

function timeStrategy(contentState, contentBlock, callback) {
  findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  console.log(contentBlock);
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const HandleSpan = (props) => {
  return (
    <span
      style={styles.handle}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};

const styles = {
  root: {
    fontFamily: '\'Helvetica\', sans-serif',
    padding: 20,
    width: 600,
  },
  editor: {
    border: '1px solid #ddd',
    cursor: 'text',
    fontSize: 16,
    minHeight: 40,
    padding: 10,
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  },
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};                               
                                
                                
                                
