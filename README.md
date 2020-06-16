# Description

`Transformer` is a software interface to the [Elgato Stream Deck](https://www.elgato.com/en/gaming/stream-deck).

Also see, [Stream Deck SDK](https://developer.elgato.com/documentation/stream-deck/sdk/overview/).

# Features

- Code written in Javascript
- Cross-platform (macOS, Windows)
- Localized

<p align="center">
    <img width="460" src="https://github.com/CodeKindness/streamdeck-transformer/blob/master/screenshot.jpg">
</p>

# Installation

In the [Release](./Release/) folder, you can find the file `com.codekindness.transformer.streamDeckPlugin`. If you double-click this file on your machine, Stream Deck will install the plugin.

# Development

You can use vanilla Javascript (ES2015, ES6 and even ES7 is okay to use) or you can even include/import a library of your choice (e.g. jQuery, VueJS, etc...).

## Installation

Quit the Stream Deck application.

On macOS copy the contents of this directory to the Stream Deck plugins folder.

```
cp -r Sources/com.codekindness.transformer.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
```

On Windows the plugins directory can be found here:

```
%appdata%\Elgato\StreamDeck\Plugins\
```

If you now launch the Stream Deck application, this plugin should appear in the `Custom` category in the Actions list.

## Debugging

### Debugging your Javascript plugin

You can debug your Javascript plugin and/or Property Inspector using Google Chrome's web developer tools. In order to do so, you first need to enable the HTML remote debugger in Stream Deck.

On macOS, you will need to run the following command line in the Terminal:
```
defaults write com.elgato.StreamDeck html_remote_debugging_enabled -bool YES
```

On Windows, you will need to add a DWORD `html_remote_debugging_enabled` with value `1` in the registry `@ HKEY_CURRENT_USER\Software\Elgato Systems GmbH\StreamDeck`.

After you relaunch the Stream Deck app, you can open [http://localhost:23654](http://localhost:23654) in Chrome, where you will find a list of 'Inspectable pages' (plugins). Inspecting your plugin is pretty straightforward: Click the reverse DNS name of your plugin and Chrome shows it's developer tools, where you can further inspect used components and log messages.

# Resources

All icons are taken from [Icons8](https://icons8.com).
