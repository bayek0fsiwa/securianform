import { browser } from '@wdio/globals';
import CalculatorPage from '../pages/calculator.page';
import { sampleDataList } from '../data/retirementData';
import { ActionUtils } from '../utils/ActionUtils';

const CURRENT_AGE_FOR_INVALID_TEST = 45;
const RETIREMENT_AGE_LESS_THAN_CURRENT = 40;

describe('Retirement Calculator Validation (Negative Testing)', () => {

    beforeEach(async () => {
        await browser.maximizeWindow();
        await CalculatorPage.open();
    });

    it('should show validation errors when required fields are blank', async () => {
        // Submit without filling any fields
        await ActionUtils.clickElement(CalculatorPage.btnCalculate);

        await CalculatorPage.verifyRequiredFieldErrors();
    });

    it('should show specific error when retirement age is less than or equal to current age', async () => {
        const sampleData = sampleDataList[0];

        await ActionUtils.setInputValue(CalculatorPage.inputCurrentAge, CURRENT_AGE_FOR_INVALID_TEST);
        await ActionUtils.setInputValue(CalculatorPage.inputRetirementAge, RETIREMENT_AGE_LESS_THAN_CURRENT);
        await ActionUtils.setMaskedValue(CalculatorPage.inputCurrentIncome, sampleData.currentAnnualIncome);
        await ActionUtils.setMaskedValue(CalculatorPage.inputCurrentSavings, sampleData.currentRetirementSavings);
        await ActionUtils.setMaskedValue(CalculatorPage.inputAnnualSavings, sampleData.currentRetirementContribution);
        await ActionUtils.setMaskedValue(CalculatorPage.inputSavingsIncreaseRate, sampleData.annualContributionIncrease);
        
        await ActionUtils.clickElement(CalculatorPage.btnCalculate);
        await CalculatorPage.verifyAgeMismatchError();
    });
});
