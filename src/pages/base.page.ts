import { browser } from '@wdio/globals';
import allureReporter from '@wdio/allure-reporter';
import { logger } from '../utils/logger';

export default class BasePage {

    public async open(path: string) {
        logger(`Opening URL: ${path}`);
        allureReporter.addStep(`Opening URL: ${path}`);
        await browser.url(path);
    }

    // Wait for an element to be displayed, scrolls it into view, and waits until it is enabled/clickable.
    private async waitForReady(el: WebdriverIO.Element, clickable = false) {
        await el.waitForDisplayed();
        await el.scrollIntoView();
        if (clickable) {
            await el.waitForClickable();
        } else {
            await el.waitForEnabled();
        }
    }

    public async setInputValue(element: WebdriverIO.Element, value: string | number) {
        const el = await element;
        const selector = el.selector;
        logger(`Setting value "${value}" on ${selector}`);
        allureReporter.addStep(`Setting value "${value}" on ${selector}`);
        await this.waitForReady(el);
        await el.click();
        await browser.keys(['Control', 'a']);
        await el.setValue(value.toString());
        await browser.keys('Tab');
        await browser.waitUntil(async () => {
            const raw = await el.getValue();
            return raw.includes(value.toString());
        }, { timeout: 3000, timeoutMsg: `Value "${value}" was not set in ${selector}` });
    }

    public async setMaskedValue(element: any, value: string | number) {
        const el = await element;
        const selector = el.selector;
        logger(`Setting masked value "${value}" on ${selector}`);
        allureReporter.addStep(`Setting masked value "${value}" on ${selector}`);
        await this.waitForReady(el, true);
        await el.click();
        await browser.execute((elem: any) => {
            elem.value = '';
            elem.dispatchEvent(new Event('input', { bubbles: true }));
            elem.dispatchEvent(new Event('change', { bubbles: true }));
        }, el);
        await browser.keys(['Control', 'a', 'Backspace']);
        for (const char of value.toString()) {
            await browser.keys(char);
        }
        await browser.execute((elem: any) => elem.blur(), el);

        const numericStr = value.toString().replace(/[^0-9.]/g, '');
        await browser.waitUntil(async () => {
            const rawNumeric = (await el.getValue()).replace(/[^0-9.]/g, '');
            return rawNumeric.includes(numericStr);
        }, {
            timeout: 5000,
            interval: 500,
            timeoutMsg: `Masked value "${value}" not confirmed in ${selector}`
        });
    }

    public async clickElement(element: any) {
        const el = await element;
        const selector = el.selector;
        logger(`Clicking on ${selector}`);
        allureReporter.addStep(`Clicking on ${selector}`);
        await this.waitForReady(el, true);
        await browser.execute((elem: any) => {
            if (elem) {
                elem.scrollIntoView({ block: 'center', inline: 'nearest' });
                elem.click();
            }
        }, el);
    }
}