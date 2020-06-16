var websocket = null;
var pluginUUID = null;
var DestinationEnum = Object.freeze({"HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2})
var timer;
var counterAction = {
  type: "com.codekindness.transformer.action",

  // context: instance of an action.
  onKeyDown: function (context, settings, coordinates, userDesiredState) {
    // timer = setTimeout(function () {
    //   var updatedSettings = {};
    //   updatedSettings["keyPressCounter"] = -1;
    //
    //   counterAction.SetSettings(context, updatedSettings);
    //   counterAction.SetTitle(context, 0);
    // }, 1500);
  },

  onKeyUp: function (context, settings, coordinates, userDesiredState) {

    // clearTimeout(timer);
    //
    // var keyPressCounter = 0;
    //
    // if (settings != null && settings.hasOwnProperty('keyPressCounter')) {
    //   keyPressCounter = settings["keyPressCounter"];
    // }
    //
    // keyPressCounter++;
    //
    // updatedSettings = {};
    // updatedSettings["keyPressCounter"] = keyPressCounter;
    //
    // this.SetSettings(context, updatedSettings);
    //
    // this.SetTitle(context, keyPressCounter);

    this.transform(context, settings, coordinates);
  },

  // occurs when action appears in canvas area
  onWillAppear: function (context, settings, coordinates) {
    // var keyPressCounter = 0;
    //
    // if (settings != null && settings.hasOwnProperty('keyPressCounter')) {
    //   keyPressCounter = settings["keyPressCounter"];
    // }
    //
    // this.SetTitle(context, keyPressCounter);
  },

  transform: function (context, settings, coordinates) {
    let clipboard   = this.getClipboard();
    let regex       = new RegExp(settings.replaceInput || '.*');
    let replacement = settings.selectionTextInput || '';
    let result      = clipboard;

    // will evaluate to true if value is not: null, undefined, NaN, empty string (""), 0, false
    if (clipboard) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/n
      result = clipboard.replace(regex, replacement);
    }

    this.setClipboard(result);
  },

  // getClipboard: async function () {
  //   if (!navigator.clipboard) {
  //     // Clipboard API not available
  //     return;
  //   }
  //
  //   navigator.permissions.query({ name: 'clipboard-read' }).then(result => {
  //     // If permission to read the clipboard is granted or if the user will
  //     // be prompted to allow it, we proceed.
  //     if (result.state === 'granted' || result.state === 'prompt') {
  //       navigator.clipboard.readText()
  //         .then(text => {
  //           console.log('Pasted content: ', text);
  //           return 'clipboard content';
  //         })
  //         .catch(err => {
  //           console.error(err.message, err);
  //           // Document is not focused. DOMException
  //           return 'clipboard fucked';
  //         });
  //     }
  //   });
  // },

  getClipboard: function () {
    // Get the text field
    let copyText = document.getElementById("clipboardDummy");

    // Show field
    copyText.style.display = "";

    // Select the text field
    copyText.select();

    // Set value
    document.execCommand("paste");

    // Hide field
    copyText.style.display = "none";

    return copyText.value;
  },

  setClipboard: function (text) {
    // Get the text field
    let copyText = document.getElementById("clipboardDummy");

    // Show field
    copyText.style.display = "";

    // Set Text
    copyText.value = text;

    // Select the text field
    copyText.select();

    // Copy the text inside the text field
    document.execCommand("copy");

    // Hide field
    copyText.style.display = "none";
  },

  SetTitle: function (context, text) {
    var json = {
      "event": "setTitle",
      "context": context,
      "payload": {
        "title": "" + text,
        "target": DestinationEnum.HARDWARE_AND_SOFTWARE
      }
    };

    websocket.send(JSON.stringify(json));
  },

  SetInputSettings: function (context, payload) {
    let results = {};

    if (payload.sdpi_collection != null) {
      results['replaceInput'] = payload['replaceInput'];
      results['selectionTextInput'] = payload['selectionTextInput'];

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
  },

  openUrl: function (url) {
    let json = {
      "event": "openUrl",
      "payload": {
        "url": url
      }
    };
    websocket.send(JSON.stringify(json));
  }
};

// This function is called when the plugin is loaded
// @param [JSON] inInfo Contains information about application, plugin, devices.
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
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
    } else if (event == 'deviceDidConnect') {
      counterAction.getClipboard();
    } else if (event == 'propertyInspectorDidAppear') {
      let action  = jsonObj['action']; // "com.codekindness.transformer.action"
      let context = jsonObj['context']; // "A04D5B463BDFB12E88315D4C1D8E78B6"
      let device  = jsonObj['device']; // "DDC80152FF8613EBCFF6DFA14142FE10"
      let event   = jsonObj['event']; // "propertyInspectorDidAppear"
    }

    console.log(event, evt);
  };

  websocket.onclose = function () {
    // Websocket is closed
  };
}
