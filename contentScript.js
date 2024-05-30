import { initialize } from './src/contentScripts/index.js';

import jQuery from "jquery";

window.$ = jQuery;

initialize();
