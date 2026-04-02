import { expect, browser } from '@wdio/globals';
import CalculatorPage from '../pages/calculator.page';
import { sampleDataList } from '../data/retirementData';

describe('Retirement Calculator E2E (Data-Driven)', () => {

    beforeEach(async () => {
        await browser.maximizeWindow();
        await CalculatorPage.open();
    });

    sampleDataList.forEach((data, index) => {
        it(`should complete full user journey without SSN for dataset ${index + 1}`, async () => {
            // Step 1: Fill required fields
            await CalculatorPage.fillRequiredFields(data);
            // Step 2: Fill optional spouse income
            await CalculatorPage.fillOptionalIncomeFields(data);
            
            // Step 3: Explicitly set SSN to false for this primary E2E path
            await CalculatorPage.setSocialSecurity(false);
            
            // Step 4: Open "Adjust default values" modal, fill fields, and save
            await CalculatorPage.adjustDefaultValues(data);
            
            // Step 5: Submit and wait for results
            await CalculatorPage.submitForm();
            
            // Step 6: Assert results section is visible and has content
            await expect(CalculatorPage.resultsContainer).toBeDisplayed();
            const resultsText = await CalculatorPage.resultsContainer.getText();
            expect(resultsText.length).toBeGreaterThan(0);
        });

        it(`should specifically test the Social Security toggling scenario for dataset ${index + 1}`, async () => {
            // Fill required fields to enable calculation
            await CalculatorPage.fillRequiredFields(data);
            
            // Test Social Security toggling specifically
            await CalculatorPage.fillSocialSecurityDetails(data);
            
            // Submit and verify
            await CalculatorPage.submitForm();
            
            await expect(CalculatorPage.resultsContainer).toBeDisplayed();
            const resultsText = await CalculatorPage.resultsContainer.getText();
            expect(resultsText.length).toBeGreaterThan(0);
        });
    });
});