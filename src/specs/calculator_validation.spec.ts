import { browser } from '@wdio/globals';
import CalculatorPage from '../pages/calculator.page';
import { negativeDataList } from '../data/negativeTestData';

describe('Retirement Calculator Validation (Negative Testing)', () => {

    beforeEach(async () => {
        await browser.maximizeWindow();
        await CalculatorPage.open();
    });

    it('should show validation errors when required fields are blank', async () => {
        await CalculatorPage.clickCalculate();
        await CalculatorPage.verifyRequiredFieldErrors();
    });

    // Data-driven negative tests: iterate over every scenario in negativeData.json
    negativeDataList.forEach((negData, index) => {
        it(`should show age mismatch error for negative scenario ${index + 1}: ${negData.scenario}`, async () => {
            // Step 1: Fill all required fields using the negative test data via page method
            await CalculatorPage.fillFieldsForNegativeTest(negData);

            // Step 2: Submit the form
            await CalculatorPage.clickCalculate();

            // Step 3: Verify the expected validation error is displayed
            await CalculatorPage.verifyAgeMismatchError(negData.expectedError);
        });
    });
});
