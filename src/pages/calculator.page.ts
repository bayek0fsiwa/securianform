import { browser, expect, $, $$ } from '@wdio/globals';
import { logger, logError } from '../utils/logger';
import BasePage from './base.page';
import { RetirementData } from '../data/retirementData';
import { NegativeTestData } from '../data/negativeTestData';
import { ActionUtils } from '../utils/ActionUtils';
import { TIMEOUT_MEDIUM, TIMEOUT_LONG, POLL_INTERVAL } from '../utils/constants';

class CalculatorPage extends BasePage {

    // Required-field inputs
    get inputCurrentAge() { return $('#current-age'); }
    get inputRetirementAge() { return $('#retirement-age'); }
    get inputCurrentIncome() { return $('#current-income'); }
    get inputSpouseIncome() { return $('#spouse-income'); }
    get inputCurrentSavings() { return $('#current-total-savings'); }
    get inputAnnualSavings() { return $('#current-annual-savings'); }
    get inputSavingsIncreaseRate() { return $('#savings-increase-rate'); }

    // Social Security
    get labelSocialSecurityYes() { return $('label[for="yes-social-benefits"]'); }
    get labelSocialSecurityNo() { return $('label[for="no-social-benefits"]'); }
    get containerSocialSecurityFields() { return $$('.social-security-field'); }
    get labelMarried() { return $('label[for="married"]'); }
    get inputSocialSecurityOverride() { return $('#social-security-override'); }

    // Default Values modal
    get adjustDefaultValuesLink() { return $('a[data-bs-target="#default-values-modal"]'); }
    get modalDefaultValues() { return $('#default-values-modal'); }
    get additionalIncome() { return $('#additional-income'); }
    get retirementDuration() { return $('#retirement-duration'); }
    get includeInflation() { return $('input[name="inflation-inclusion"][value="Y"]'); }
    get expectedInflationRate() { return $('#expected-inflation-rate'); }
    get retirementAnnualIncome() { return $('#retirement-annual-income'); }
    get preRetirementROI() { return $('#pre-retirement-roi'); }
    get postRetirementROI() { return $('#post-retirement-roi'); }
    get saveButton() { return $('button[onclick="savePersonalizedValues();"]'); }

    // Calculate + Results
    get btnCalculate() { return $('button=Calculate'); }
    get resultsContainer() { return $('#calculator-results-container'); }
    get resultMessage() { return $('#result-message'); }
    get retirementAmount() { return $('#retirement-amount-results'); }
    get resultsChart() { return $('#results-chart'); }

    // Validation error elements
    get alertRequiredFields() { return $('#calculator-input-alert-desc'); }
    get errorCurrentAge() { return $('#invalid-current-age-error'); }
    get errorRetirementAge() { return $('#invalid-retirement-age-error'); }
    get errorCurrentIncome() { return $('#invalid-current-income-error'); }
    get errorCurrentSavings() { return $('#invalid-current-total-savings-error'); }
    get errorAnnualSavings() { return $('#invalid-current-annual-savings-error'); }
    get errorSavingsIncreaseRate() { return $('#invalid-savings-increase-rate-error'); }

    // Page navigation
    /**
     * Opens the calculator page.
     */
    public async open(): Promise<void> {
        try {
            await super.open('');
        } catch (error) {
            logError(`Error in open: ${error}`);
            throw error;
        }
    }

    // Actions

    /**
     * Fills the required fields for the retirement calculator.
     * @param data The retirement data.
     */
    public async fillRequiredFields(data: RetirementData): Promise<void> {
        try {
            await ActionUtils.setInputValue(this.inputCurrentAge, data.currentAge);
            await ActionUtils.setInputValue(this.inputRetirementAge, data.retirementAge);
            await ActionUtils.setMaskedValue(this.inputCurrentIncome, data.currentAnnualIncome);
            await ActionUtils.setMaskedValue(this.inputCurrentSavings, data.currentRetirementSavings);
            await ActionUtils.setMaskedValue(this.inputAnnualSavings, data.currentRetirementContribution);
            await ActionUtils.setMaskedValue(this.inputSavingsIncreaseRate, data.annualContributionIncrease);
        } catch (error) {
            logError(`Error in fillRequiredFields: ${error}`);
            throw error;
        }
    }

    /**
     * Fills the optional spouse income field.
     * @param data The retirement data.
     */
    public async fillOptionalIncomeFields(data: RetirementData): Promise<void> {
        try {
            if (data.spouseAnnualIncome) {
                await ActionUtils.setMaskedValue(this.inputSpouseIncome, data.spouseAnnualIncome);
            }
        } catch (error) {
            logError(`Error in fillOptionalIncomeFields: ${error}`);
            throw error;
        }
    }

    /**
     * Toggles the Social Security options.
     * @param enable Boolean to enable or disable social security.
     */
    public async setSocialSecurity(enable: boolean): Promise<void> {
        try {
            if (enable) {
                await ActionUtils.clickElement(this.labelSocialSecurityYes);
            } else {
                await ActionUtils.clickElement(this.labelSocialSecurityNo);
            }
        } catch (error) {
            logError(`Error in setSocialSecurity: ${error}`);
            throw error;
        }
    }

    /**
     * Fills the Social Security details.
     * @param data The retirement data.
     */
    public async fillSocialSecurityDetails(data: RetirementData): Promise<void> {
        try {
            await this.setSocialSecurity(true);

            // Wait for the first social security field to become visible
            const ssFields = this.containerSocialSecurityFields;
            if (await ssFields.length > 0) {
                await (await ssFields)[0].waitForDisplayed({ timeout: TIMEOUT_MEDIUM });
            }

            if (data.relationshipStatus === 'Married') {
                await ActionUtils.clickElement(this.labelMarried);
            }
            if (data.socialSecurityOverride !== undefined && data.socialSecurityOverride !== null) {
                await ActionUtils.setMaskedValue(this.inputSocialSecurityOverride, data.socialSecurityOverride);
            }
        } catch (error) {
            logError(`Error in fillSocialSecurityDetails: ${error}`);
            throw error;
        }
    }

    /**
     * Adjusts the default values via the modal window.
     * @param data The retirement data.
     */
    public async adjustDefaultValues(data: RetirementData): Promise<void> {
        try {
            await ActionUtils.clickElement(this.adjustDefaultValuesLink);

            const modal = await this.modalDefaultValues;
            await modal.waitForDisplayed({ timeout: TIMEOUT_LONG });
            
            await browser.waitUntil(async () => {
                const classList = await modal.getAttribute('class');
                return classList?.includes('show');
            }, { timeout: TIMEOUT_MEDIUM, timeoutMsg: 'Default values modal did not finish opening' });

            await ActionUtils.waitForReady(this.additionalIncome, true);

            if (data.additionalIncome !== undefined) {
                await ActionUtils.setMaskedValue(this.additionalIncome, data.additionalIncome);
            }
            if (data.yearsRetirementNeedsToLast !== undefined) {
                await ActionUtils.setInputValue(this.retirementDuration, data.yearsRetirementNeedsToLast);
            }
            if (data.postRetirementInflation !== undefined) {
                const radioId = data.postRetirementInflation ? 'include-inflation' : 'exclude-inflation';
                const radioLabel = await $(`label[for="${radioId}"]`);
                await ActionUtils.waitForReady(radioLabel, true);
                await ActionUtils.executeClick(radioLabel);
                const radioButton = await $(`#${radioId}`);
                await browser.waitUntil(async () => await radioButton.isSelected(), {
                    timeout: TIMEOUT_MEDIUM,
                    interval: POLL_INTERVAL,
                    timeoutMsg: `Inflation radio button #${radioId} was not selected after click`
                });
            }
            if (data.percentFinalIncomeDesired !== undefined) {
                await ActionUtils.setMaskedValue(this.retirementAnnualIncome, data.percentFinalIncomeDesired);
            }
            if (data.preRetirementInvestmentReturn !== undefined) {
                await ActionUtils.setMaskedValue(this.preRetirementROI, data.preRetirementInvestmentReturn);
            }
            if (data.postRetirementInvestmentReturn !== undefined) {
                await ActionUtils.setMaskedValue(this.postRetirementROI, data.postRetirementInvestmentReturn);
            }

            await ActionUtils.clickElement(this.saveButton);
            await modal.waitForDisplayed({ timeout: TIMEOUT_LONG, reverse: true });
        } catch (error) {
            logError(`Error in adjustDefaultValues: ${error}`);
            throw error;
        }
    }

    /**
     * Submits the calculator form and waits for results.
     */
    public async submitForm(): Promise<void> {
        try {
            await ActionUtils.clickElement(this.btnCalculate);

            await ActionUtils.waitForReady(this.resultsChart, false);

            await browser.waitUntil(async () => {
                const text = await this.resultMessage.getText();
                return text.trim().length > 0;
            }, {
                timeout: TIMEOUT_LONG,
                timeoutMsg: 'Result message was not populated after calculation'
            });
        } catch (error) {
            logError(`Error in submitForm: ${error}`);
            throw error;
        }
    }
    
    // Validation Methods

    /**
     * Verifies that the required field errors are displayed correctly.
     */
    public async verifyRequiredFieldErrors(): Promise<void> {
        try {
            await expect(this.alertRequiredFields).toBeDisplayed();
            await expect(this.alertRequiredFields).toHaveText('Please fill out all required fields');
            await expect(this.errorCurrentAge).toBeDisplayed();
            await expect(this.errorCurrentAge).toHaveText('Input required');
            await expect(this.errorRetirementAge).toBeDisplayed();
            await expect(this.errorRetirementAge).toHaveText('Input required');
            await expect(this.errorCurrentIncome).toBeDisplayed();
            await expect(this.errorCurrentIncome).toHaveText('Input required');
            await expect(this.errorCurrentSavings).toBeDisplayed();
            await expect(this.errorCurrentSavings).toHaveText('Input required');
            await expect(this.errorAnnualSavings).toBeDisplayed();
            await expect(this.errorAnnualSavings).toHaveText('Input required');
            await expect(this.errorSavingsIncreaseRate).toBeDisplayed();
            await expect(this.errorSavingsIncreaseRate).toHaveText('Input required');
        } catch (error) {
            logError(`Error in verifyRequiredFieldErrors: ${error}`);
            throw error;
        }
    }

    /**
     * Verifies that the age mismatch error is displayed correctly.
     * @param expectedMessage Optional custom expected error message. Defaults to the standard mismatch text.
     */
    public async verifyAgeMismatchError(
        expectedMessage = 'Planned retirement age must be greater than current age'
    ): Promise<void> {
        try {
            await expect(this.errorRetirementAge).toBeDisplayed();
            await expect(this.errorRetirementAge).toHaveText(expectedMessage);
        } catch (error) {
            logError(`Error in verifyAgeMismatchError: ${error}`);
            throw error;
        }
    }

    /**
     * Fills the required fields using negative test data for validation scenarios.
     * Uses NegativeTestData which contains only the fields needed for negative testing.
     * @param data The negative test data containing the invalid field values.
     */
    public async fillFieldsForNegativeTest(data: NegativeTestData): Promise<void> {
        try {
            logger(`Filling fields for negative test scenario: ${data.scenario}`);
            await ActionUtils.setInputValue(this.inputCurrentAge, data.currentAge);
            await ActionUtils.setInputValue(this.inputRetirementAge, data.retirementAge);
            await ActionUtils.setMaskedValue(this.inputCurrentIncome, data.currentAnnualIncome);
            await ActionUtils.setMaskedValue(this.inputCurrentSavings, data.currentRetirementSavings);
            await ActionUtils.setMaskedValue(this.inputAnnualSavings, data.currentRetirementContribution);
            await ActionUtils.setMaskedValue(this.inputSavingsIncreaseRate, data.annualContributionIncrease);
        } catch (error) {
            logError(`Error in fillFieldsForNegativeTest: ${error}`);
            throw error;
        }
    }

    /**
     * Clicks the calculate button without waiting for results.
     * Used for negative test scenarios where form submission is expected to show validation errors.
     */
    public async clickCalculate(): Promise<void> {
        try {
            await ActionUtils.clickElement(this.btnCalculate);
        } catch (error) {
            logError(`Error in clickCalculate: ${error}`);
            throw error;
        }
    }
}

export default new CalculatorPage();
