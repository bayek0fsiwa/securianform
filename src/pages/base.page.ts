import { browser } from '@wdio/globals';
import allureReporter from '@wdio/allure-reporter';
import { logger } from '../utils/logger';

export default class BasePage {

    /**
     * Opens a specific path in the browser.
     * @param path The path to navigate to.
     */
    public async open(path: string): Promise<void> {
        try {
            logger(`Opening URL: ${path}`);
            allureReporter.addStep(`Opening URL: ${path}`);
            await browser.url(path);
        } catch (error) {
            logger(`Error opening URL ${path}: ${error}`);
            throw new Error(`Failed to open URL ${path}: ${error}`);
        }
    }
}