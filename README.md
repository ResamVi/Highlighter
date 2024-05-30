# Highlighter

Firefox port of [jeromepl/highlighter](https://github.com/jeromepl/highlighter)

A simple Firefox extension that allows the highlighting of text on webpages with a simple right-click (or keyboard shortcut Alt+A). 
Saves all highlights across all devices running Firefox so they can be re-highlighted when a webpage is reopened!

![images/preview.gif](images/preview.gif)

Available for [Download in Firefox](TODO)

## Changes in this Fork
Features
- Introduces sync storage to work across multiple Firefox devices.
- Removed telemetry

Technical
- Fix a bug with Firefox where highlights are shown for a short time and then disappear
- Introduce permission prompt as Firefox handles host_permissions differently to Chrome
- Introduce Parcel as workaround for Firefox extensions not supporting static import
- Drop support for older highlight versions and restart versioning at 1.0.0

## Development

To start development, clone the repo and run

```sh
npm install
```

For local development run
```sh
npm run develop
```
Creates a `dist` folder. 

In Firefox type `about:debugging` into the address bar. Go to `This Firefox` and in `Load Temporary Add-On` upload a file of the generated `dist` folder.

For a release build run
```sh
npm run build
```

## Other commands

- Linting (ESLint): `npm run lint`
- Rebuild extension on file change: `npm run watch`
