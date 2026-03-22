import { expect } from '@wdio/globals';
import CalculatorPage from '../pages/calculator.page';
import { sampleData } from '../data/retirementData';

describe('Retirement Calculator Validation (Negative Testing)', () => {

    beforeEach(async () => {
        await browser.maximizeWindow();
        await CalculatorPage.open();
    });

    it('should show validation errors when required fields are blank', async () => {
        // Submit without filling any fields
        await CalculatorPage.clickElement(CalculatorPage.btnCalculate);
        // Assert top-level alert
        await expect(CalculatorPage.alertRequiredFields).toBeDisplayed();
        await expect(CalculatorPage.alertRequiredFields).toHaveText('Please fill out all required fields');
        // Assert field-specific errors
        await expect(CalculatorPage.errorCurrentAge).toBeDisplayed();
        await expect(CalculatorPage.errorCurrentAge).toHaveText('Input required');
        await expect(CalculatorPage.errorRetirementAge).toBeDisplayed();
        await expect(CalculatorPage.errorRetirementAge).toHaveText('Input required');
        await expect(CalculatorPage.errorCurrentIncome).toBeDisplayed();
        await expect(CalculatorPage.errorCurrentIncome).toHaveText('Input required');
        await expect(CalculatorPage.errorCurrentSavings).toBeDisplayed();
        await expect(CalculatorPage.errorCurrentSavings).toHaveText('Input required');
        await expect(CalculatorPage.errorAnnualSavings).toBeDisplayed();
        await expect(CalculatorPage.errorAnnualSavings).toHaveText('Input required');
        await expect(CalculatorPage.errorSavingsIncreaseRate).toBeDisplayed();
        await expect(CalculatorPage.errorSavingsIncreaseRate).toHaveText('Input required');
    });

    it('should show specific error when retirement age is less than or equal to current age', async () => {
        await CalculatorPage.setInputValue(CalculatorPage.inputCurrentAge, 45);
        await CalculatorPage.setInputValue(CalculatorPage.inputRetirementAge, 40);
        await CalculatorPage.setMaskedValue(CalculatorPage.inputCurrentIncome, sampleData.currentAnnualIncome);
        await CalculatorPage.setMaskedValue(CalculatorPage.inputCurrentSavings, sampleData.currentRetirementSavings);
        await CalculatorPage.setMaskedValue(CalculatorPage.inputAnnualSavings, sampleData.currentRetirementContribution);
        await CalculatorPage.setMaskedValue(CalculatorPage.inputSavingsIncreaseRate, sampleData.annualContributionIncrease);
        await CalculatorPage.clickElement(CalculatorPage.btnCalculate);
        await expect(CalculatorPage.errorRetirementAge).toBeDisplayed();
        await expect(CalculatorPage.errorRetirementAge).toHaveText('Planned retirement age must be greater than current age');
    });
});
