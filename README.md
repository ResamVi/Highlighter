# Highlighter

Firefox port of [jeromepl/highlighter](https://github.com/jeromepl/highlighter)

A simple Firefox extension that allows the highlighting of text on webpages with a simple right-click (or keyboard shortcut Alt+A). 
Saves all highlights across all devices running Firefox so they can be re-highlighted when a webpage is reopened!

![images/preview.gif](images/preview.gif)

Available for [Download in Firefox](https://addons.mozilla.org/en-US/firefox/addon/highlighter-by-resamvi)

## Changes in this Fork
Features
- ~~Introduces sync storage to work across multiple Firefox devices.~~
    - Sync storage is too limited. Feature is removed.
- Removed telemetry
- Decrease highlight opacity so highlighted text is visible on dark mode websites
- Highlighting works on Single-page applications that change their content (without their URL changing)

Technical
- Fix a bug with Firefox where highlights are shown for a short time and then disappear
- Introduce Parcel as workaround for Firefox extensions not supporting static import
- Drop support for older highlight versions and restart versioning at 1.0.0
- (If using Manifest V3) Introduce permission prompt as Firefox handles host_permissions differently to Chrome in V3

TODOs
- 100% CPU due to 'Reflow' and a memory leak probably (https://developer.mozilla.org/en-US/docs/Glossary/Reflow)
- Context Menu entry
- Choose color button not working
- Introduce metrics on server side
- Log server errors with inputs/outputs
- Log client request failures 
- Introduce Export function?
- Encrypt body
- Double click highlighted paragraphs cannot be 


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

For a raw build run
```sh
npm run build
```
Which creates an optimized build in a `dist` folder


For a release build run
```sh
npm run build-xpi
```
Which creates an `.xpi` 

## Other commands

- Linting (ESLint): `npm run lint`
- Rebuild extension on file change: `npm run watch`
