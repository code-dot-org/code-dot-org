import FirebaseStorage from './firebaseStorage';
import {
  init,
} from './firebaseUtils';

const DatablockStorage = {...FirebaseStorage};

function getAuthToken() {
  return document.querySelector('meta[name="csrf-token"]').content;
}

async function getKeyValue(key) {
  const response = await fetch("../data_db/get_key_value?" + new URLSearchParams({
      key,
      authenticity_token: getAuthToken(),
  }), {
    method: "GET",
  });
  const json = await response.json();
  console.log("json is ", json);
  return json === null ? undefined : json;
}

DatablockStorage.getKeyValue = function (key, onSuccess, onError) {
  console.log("Using the overridden DatablockStorage method");
  return getKeyValue(key).then(onSuccess, onError);
}

DatablockStorage.setKeyValue = function (key, value, onSuccess, onError) {
  console.log("Using the overridden DatablockStorage method");

  fetch("../data_db/set_key_value", {
    method: "POST",
    body: JSON.stringify({
      key,
      value: JSON.stringify(value),
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getAuthToken(),
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
  }).then(onSuccess, onError);
}

export function initDatablockStorage(config) {
  console.log("LOADING DATABLOCK STORAGE SHIM!!!");
  init(config);
  return DatablockStorage;
}

export default DatablockStorage;