import { expect } from '@wdio/globals';
import CalculatorPage from '../pages/calculator.page';
import { sampleData } from '../data/retirementData';

describe('Retirement Calculator E2E', () => {

    beforeEach(async () => {
        await browser.maximizeWindow();
        await CalculatorPage.open();
    });

    /**
     * Full E2E: all fields + submit + wait for result
     */
    it('should complete full user journey: fill all fields, submit, and display retirement results', async () => {
        // Step 1: Fill required fields
        await CalculatorPage.fillRequiredFields(sampleData);
        // Step 2: Fill optional spouse income
        await CalculatorPage.fillOptionalIncomeFields(sampleData);
        // Step 3: Toggle Social Security Yes + fill SS details
        await CalculatorPage.fillSocialSecurityDetails(sampleData);
        // Step 4: Open "Adjust default values" modal, fill fields, and save
        await CalculatorPage.adjustDefaultValues(sampleData);
        // Step 5: Submit and wait for results
        await CalculatorPage.submitForm();
        // Step 6: Assert results section is visible and has content
        await expect(CalculatorPage.resultsContainer).toBeDisplayed();
        const resultsText = await CalculatorPage.resultsContainer.getText();
        expect(resultsText.length).toBeGreaterThan(0);
    });
});