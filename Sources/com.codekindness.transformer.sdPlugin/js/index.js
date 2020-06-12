var websocket = null;
var pluginUUID = null;
var DestinationEnum = Object.freeze({"HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2})
var timer;
var counterAction = {
  type: "com.codekindness.transformer.action",

  // context: instance of an action.
  onKeyDown: function (context, settings, coordinates, userDesiredState) {
    timer = setTimeout(function () {
      var updatedSettings = {};
      updatedSettings["keyPressCounter"] = -1;

      counterAction.SetSettings(context, updatedSettings);
      counterAction.SetTitle(context, 0);
    }, 1500);
  },

  onKeyUp: function (context, settings, coordinates, userDesiredState) {

    clearTimeout(timer);

    var keyPressCounter = 0;

    if (settings != null && settings.hasOwnProperty('keyPressCounter')) {
      keyPressCounter = settings["keyPressCounter"];
    }

    keyPressCounter++;

    updatedSettings = {};
    updatedSettings["keyPressCounter"] = keyPressCounter;

    this.SetSettings(context, updatedSettings);

    this.SetTitle(context, keyPressCounter);

    this.transform(context, settings, coordinates);
  },

  // occurs when action appears in canvas area
  onWillAppear: function (context, settings, coordinates) {
    var keyPressCounter = 0;

    if (settings != null && settings.hasOwnProperty('keyPressCounter')) {
      keyPressCounter = settings["keyPressCounter"];
    }

    this.SetTitle(context, keyPressCounter);
  },

  transform: function (context, settings, coordinates) {
    // var pasteText = document.querySelector("#output");
    // pasteText.focus();
    // document.execCommand("paste");
    // console.log(pasteText.textContent);

    let clipboard = 'clipboard text'; // navigator.clipboard.readText();
    let regex = '.*';
    let replacement = clipboard;
    let result = clipboard;

    if (settings != null && settings.hasOwnProperty('replaceInput')) {
      regex = RegExp(settings.replaceInput);

      replacement = clipboard.replace(regex, settings['replaceInput']);
      result = settings['selectionTextInput'].replace(/\$\{[0-9]+\}/, replacement);
    }
    console.log(result);
    return result;
  },

  SetTitle: function (context, keyPressCounter) {
    console.log(keyPressCounter);
    var json = {
      "event": "setTitle",
      "context": context,
      "payload": {
        "title": "" + keyPressCounter,
        "target": DestinationEnum.HARDWARE_AND_SOFTWARE
      }
    };

    websocket.send(JSON.stringify(json));
  },

  SetInputSettings: function (context, payload) {
    let settings = {};
    let results = {};

    if (settings != null && payload.sdpi_collection != null) {
      // results = settings;
      results[payload.sdpi_collection.key] = payload.sdpi_collection.value;
      this.SetSettings(context, results);
    }
  },

  SetSettings: function (context, settings) {
    var json = {
      "event": "setSettings",
      "context": context,
      "payload": settings
    };

    websocket.send(JSON.stringify(json));
  }
};

// This function is called when the plugin is loaded
// @param [JSON] inInfo Contains information about application, plugin, devices.
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
  console.log(inActionInfo);
  pluginUUID = inPluginUUID

  // Open the web socket
  websocket = new WebSocket("ws://127.0.0.1:" + inPort);

  function registerPlugin(inPluginUUID) {
    var json = {
      "event": inRegisterEvent,
      "uuid": inPluginUUID
    };

    websocket.send(JSON.stringify(json));
  }

  websocket.onopen = function () {
    // WebSocket is connected, send message
    registerPlugin(pluginUUID);
  };

  websocket.onmessage = function (evt) {
    console.log('websocket.onmessage', evt);
    // Received message from Stream Deck
    var jsonObj = JSON.parse(evt.data);
    var event = jsonObj['event'];
    var action = jsonObj['action'];
    var context = jsonObj['context'];

    if (event == "keyDown") {
      var jsonPayload = jsonObj['payload'];
      var settings = jsonPayload['settings'];
      var coordinates = jsonPayload['coordinates'];
      var userDesiredState = jsonPayload['userDesiredState'];
      counterAction.onKeyDown(context, settings, coordinates, userDesiredState);
    } else if (event == "keyUp") {
      var jsonPayload = jsonObj['payload'];
      var settings = jsonPayload['settings'];
      var coordinates = jsonPayload['coordinates'];
      var userDesiredState = jsonPayload['userDesiredState'];
      counterAction.onKeyUp(context, settings, coordinates, userDesiredState);
    } else if (event == "willAppear") {
      var jsonPayload = jsonObj['payload'];
      var settings = jsonPayload['settings'];
      var coordinates = jsonPayload['coordinates'];
      counterAction.onWillAppear(context, settings, coordinates);
    } else if (event == "sendToPlugin") {
      let jsonPayload = jsonObj['payload'];
      counterAction.SetInputSettings(context, jsonPayload);
    }
  };

  websocket.onclose = function () {
    // Websocket is closed
  };
}
