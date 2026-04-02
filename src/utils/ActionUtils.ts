import { browser } from '@wdio/globals';
import allureReporter from '@wdio/allure-reporter';
import { logger, logError } from './logger';
import { TIMEOUT_SHORT, TIMEOUT_MEDIUM, POLL_INTERVAL } from './constants';

export type ElementArg = WebdriverIO.Element | ChainablePromiseElement | Promise<WebdriverIO.Element>;

type ChainablePromiseElement = ReturnType<typeof browser.$>;

export class ActionUtils {

    /**
     * Waits for an element to be displayed, scrolls it into view, and waits until it is enabled or clickable.
     * @param el The element to wait for.
     * @param clickable If true, waits for clickable. If false, waits for enabled.
     */
    public static async waitForReady(element: ElementArg, clickable = false): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el?.selector ?? 'unknown selector';
        try {
            await el.waitForDisplayed();
            await el.scrollIntoView();
            if (clickable) {
                await el.waitForClickable();
            } else {
                await el.waitForEnabled();
            }
        } catch (error) {
            logError(`Error waiting for element ${selector} to be ready: ${error}`);
            throw new Error(`Failed to wait for ${selector}: ${error}`);
        }
    }

    /**
     * Method to clear text using keyboard shortcuts.
     * Tries both Backspace and Delete to handle browser/platform variation.
     */
    public static async clearTextViaKeys(): Promise<void> {
        try {
            await browser.keys(['Control', 'a', 'Backspace']);
            await browser.keys(['Control', 'a', 'Delete']);
        } catch (error) {
            logError(`Error clearing text via keys: ${error}`);
            throw new Error(`Failed to clear text via keys: ${error}`);
        }
    }

    /**
     * Method to clear text using keyboard shortcuts and return to field state.
     */
    public static async clearTextViaKeysAndTab(): Promise<void> {
        try {
            await this.clearTextViaKeys();
            await browser.keys('Tab');
        } catch (error) {
            logError(`Error clearing text via keys and tab: ${error}`);
            throw new Error(`Failed to clear text via keys and tab: ${error}`);
        }
    }

    /**
     * Executes a click using vanilla Javascript in the browser.
     * @param element The element to click.
     */
    public static async executeClick(element: ElementArg): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el.selector;
        try {
            await browser.execute((elem: HTMLElement) => {
                if (elem) {
                    elem.scrollIntoView({ block: 'center', inline: 'nearest' });
                    elem.click();
                }
            }, el as unknown as HTMLElement);
        } catch (error) {
            logError(`Error executing click on element ${selector}: ${error}`);
            throw new Error(`Failed to execute click on ${selector}: ${error}`);
        }
    }

    /**
     * Executes a blur event using vanilla Javascript in the browser.
     * @param element The element to blur.
     */
    public static async executeBlur(element: ElementArg): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el.selector;
        try {
            await browser.execute((elem: HTMLElement) => {
                if (elem) {
                    elem.blur();
                }
            }, el as unknown as HTMLElement);
        } catch (error) {
            logError(`Error executing blur on element ${selector}: ${error}`);
            throw new Error(`Failed to execute blur on ${selector}: ${error}`);
        }
    }

    /**
     * Clears an element's value by dispatching input and change events.
     * @param element The element to clear.
     */
    public static async executeClearRawValue(element: ElementArg): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el.selector;
        try {
            await browser.execute((elem: HTMLInputElement) => {
                if (elem) {
                    elem.value = '';
                    elem.dispatchEvent(new Event('input', { bubbles: true }));
                    elem.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, el as unknown as HTMLInputElement);
        } catch (error) {
            logError(`Error executing clear on element ${selector}: ${error}`);
            throw new Error(`Failed to execute clear on ${selector}: ${error}`);
        }
    }

    /**
     * Sets a standard input value.
     * @param element The input element.
     * @param value The value to set.
     */
    public static async setInputValue(element: ElementArg, value: string | number): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el.selector;
        try {
            logger(`Setting value "${value}" on ${selector}`);
            allureReporter.addStep(`Setting value "${value}" on ${selector}`);
            await this.waitForReady(el);
            await el.click();
            await this.clearTextViaKeys();
            await el.setValue(value.toString());
            await browser.keys('Tab');
            await browser.waitUntil(async () => {
                const raw = await el.getValue();
                return raw.includes(value.toString());
            }, { timeout: TIMEOUT_SHORT, timeoutMsg: `Value "${value}" was not set in ${selector}` });
        } catch (error) {
            logError(`Error setting input value on element ${selector}: ${error}`);
            throw new Error(`Failed to set input value on ${selector}: ${error}`);
        }
    }

    /**
     * Sets a masked input value character by character with retries.
     * @param element The masked input element.
     * @param value The value to set.
     */
    public static async setMaskedValue(element: ElementArg, value: string | number): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el.selector;
        try {
            logger(`Setting masked value "${value}" on ${selector}`);
            allureReporter.addStep(`Setting masked value "${value}" on ${selector}`);
            await this.waitForReady(el, true);
            await el.click();
            await this.executeClearRawValue(el);
            await this.clearTextViaKeys();
            
            for (const char of value.toString()) {
                await browser.keys(char);
            }
            await this.executeBlur(el);

            const numericStr = value.toString().replace(/[^0-9.]/g, '');
            await browser.waitUntil(async () => {
                const rawNumeric = (await el.getValue()).replace(/[^0-9.]/g, '');
                return rawNumeric.includes(numericStr);
            }, {
                timeout: TIMEOUT_MEDIUM,
                interval: POLL_INTERVAL,
                timeoutMsg: `Masked value "${value}" not confirmed in ${selector}`
            });
        } catch (error) {
            logError(`Error setting masked value on element ${selector}: ${error}`);
            throw new Error(`Failed to set masked value on ${selector}: ${error}`);
        }
    }

    /**
     * Clicks an element.
     * @param element The element to click.
     */
    public static async clickElement(element: ElementArg): Promise<void> {
        const el = await element as WebdriverIO.Element;
        const selector = el.selector;
        try {
            logger(`Clicking on ${selector}`);
            allureReporter.addStep(`Clicking on ${selector}`);
            await this.waitForReady(el, true);
            await this.executeClick(el);
        } catch (error) {
            logError(`Error clicking on element ${selector}: ${error}`);
            throw new Error(`Failed to click on ${selector}: ${error}`);
        }
    }
}
