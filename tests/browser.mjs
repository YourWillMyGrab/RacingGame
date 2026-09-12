import {chromium} from '@playwright/test';
import {readFileSync} from 'node:fs';

// Default remains system Chrome; CI/local runners may supply a Chromium launch config.
export function launchBrowser() {
 const options=process.env.BROWSER_CONFIG?JSON.parse(readFileSync(process.env.BROWSER_CONFIG,'utf8')):{channel:'chrome',headless:true};
 return chromium.launch(options);
}
