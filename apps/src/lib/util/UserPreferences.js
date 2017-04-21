import $ from 'jquery';
import {Record} from 'immutable';


export default class UserPreferences extends Record({userId: 'me'}) {
  setUsingTextMode(value) {
    return $.post(`/api/v1/users/${this.userId}/using_text_mode`, {using_text_mode: value});
  }

  getUsingTextMode() {
    return $.getJSON(`/api/v1/users/${this.userId}/using_text_mode`)
            .then(response => response.using_text_mode);
  }
}
