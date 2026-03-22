import { browser } from '@wdio/globals';
import allureReporter from '@wdio/allure-reporter';
import { logger } from '../utils/logger';

export default class BasePage {

    public async open(path: string) {
        logger(`Opening URL: ${path}`);
        allureReporter.addStep(`Opening URL: ${path}`);
        await browser.url(path);
    }

    public async setInputValue(element: any, value: string | number) {
        const el = await element;
        const selector = el.selector;
        logger(`Setting value ${value} to ${selector}`);
        allureReporter.addStep(`Setting value ${value} to ${selector}`);
        await el.waitForDisplayed();
        await el.scrollIntoView();
        await el.waitForEnabled();
        await el.click();
        await browser.keys(['Control', 'a']);
        await browser.keys('Delete');
        await el.setValue(value.toString());
        await browser.keys('Tab');
        await browser.waitUntil(async () => {
            const raw = await el.getValue();
            return raw.includes(value.toString());
        }, { timeout: 3000, timeoutMsg: `Value was not set in ${selector}` });
    }

    public async setMaskedValue(element: any, value: string | number) {
        const el = await element;
        const selector = el.selector;
        logger(`Setting masked value ${value} to ${selector}`);
        allureReporter.addStep(`Setting masked value ${value} to ${selector}`);
        await el.waitForDisplayed();
        await el.scrollIntoView();
        await el.waitForClickable();
        await el.click();
        await browser.execute((elem: any) => {
            elem.value = '';
            elem.dispatchEvent(new Event('input', { bubbles: true }));
            elem.dispatchEvent(new Event('change', { bubbles: true }));
        }, el);
        await browser.keys(['Control', 'a', 'Backspace']);
        await browser.keys(['Control', 'a', 'Delete']);

        const valueStr = value.toString();
        for (const char of valueStr) {
            await browser.keys(char);
        }

        await browser.execute((element) => {
            element.blur();
        }, el);

        const numericStr = value.toString().replace(/[^0-9.]/g, '');
        await browser.waitUntil(async () => {
            const raw = await el.getValue();
            const rawNumeric = raw.replace(/[^0-9.]/g, '');
            return rawNumeric.includes(numericStr);
        }, {
            timeout: 5000,
            interval: 500,
            timeoutMsg: `Value ${value} not set correctly in masked input for ${selector}. Found: ${await el.getValue()}`
        });
    }

    public async clickElement(element: any) {
        const el = await element;
        const selector = el.selector;
        logger(`Clicking on ${selector}`);
        allureReporter.addStep(`Clicking on ${selector}`);
        await el.waitForDisplayed();
        await el.waitForClickable();
        await browser.execute((elem: any) => {
            elem.scrollIntoView({ block: 'center', inline: 'nearest' });
        }, el);
        await browser.execute((elem: any) => {
            elem.click();
        }, el);
    }
}