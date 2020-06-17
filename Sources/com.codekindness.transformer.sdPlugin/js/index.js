var websocket = null;
var pluginUUID = null;
var DestinationEnum = Object.freeze({"HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2})
var counterAction = {
  type: "com.codekindness.transformer.action",

  onKeyDown: function (context, settings, coordinates, userDesiredState) {
    this.transform(context, settings, coordinates);
  },

  onWillAppear: function (context, settings, coordinates) {
    // ...
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

    switch(event) {
      case 'keyDown':
        // When the user presses a key.
        // action, event, context, device, payload (settings, coordinates, state, userDesiredState, isInMultiAction)
        var jsonPayload = jsonObj['payload'];
        var settings = jsonPayload['settings'];
        var coordinates = jsonPayload['coordinates'];
        var userDesiredState = jsonPayload['userDesiredState'];
        counterAction.onKeyDown(context, settings, coordinates, userDesiredState);
        break;
      case 'willAppear':
        // When an instance of an action is displayed on the Stream Deck.
        // action, event, context, device, payload (settings, coordinates, state, isInMultiAction)
        var jsonPayload = jsonObj['payload'];
        var settings = jsonPayload['settings'];
        var coordinates = jsonPayload['coordinates'];
        counterAction.onWillAppear(context, settings, coordinates);
        break;
      case 'sendToPlugin':
        // When the Property Inspector sends a sendToPlugin event.
        // action, event, context, payload
        var jsonPayload = jsonObj['payload'];
        counterAction.SetInputSettings(context, jsonPayload);
        break;
    }
    console.log(event, evt);
  };

  websocket.onclose = function () {
    // Websocket is closed
  };
}
