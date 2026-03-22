import BasePage from './base.page';
import { RetirementData } from '../data/retirementData';

class CalculatorPage extends BasePage {

    // Locators
    get inputCurrentAge() { return $('#current-age'); }
    get inputRetirementAge() { return $('#retirement-age'); }
    get inputCurrentIncome() { return $('#current-income'); }
    get inputSpouseIncome() { return $('#spouse-income'); }
    get inputCurrentSavings() { return $('#current-total-savings'); }
    get inputAnnualSavings() { return $('#current-annual-savings'); }
    get inputSavingsIncreaseRate() { return $('#savings-increase-rate'); }
    get labelSocialSecurityYes() { return $('label[for="yes-social-benefits"]'); }
    get labelSocialSecurityNo() { return $('label[for="no-social-benefits"]'); }
    get containerSocialSecurityFields() { return $$('.social-security-field'); }
    get labelMarried() { return $('label[for="married"]'); }
    get inputSocialSecurityOverride() { return $('#social-security-override'); }
    get adjustDefaultValuesLink() { return $('a[data-bs-target="#default-values-modal"]'); }
    get additionalIncome() { return $('#additional-income'); }
    get retirementDuration() { return $('#retirement-duration'); }
    get includeInflation() { return $('input[name="inflation-inclusion"][value="Y"]'); }
    get expectedInflationRate() { return $('#expected-inflation-rate'); }
    get retirementAnnualIncome() { return $('#retirement-annual-income'); }
    get preRetirementROI() { return $('#pre-retirement-roi'); }
    get postRetirementROI() { return $('#post-retirement-roi'); }
    get saveButton() { return $('button[onclick="savePersonalizedValues();"]'); }
    get btnCalculate() { return $('button=Calculate'); }
    get resultsContainer() { return $('#calculator-results-container'); }
    get resultMessage() { return $('#result-message'); }
    get retirementAmount() { return $('#retirement-amount-results'); }

    // Validation Locators
    get alertRequiredFields() { return $('#calculator-input-alert-desc'); }
    get errorCurrentAge() { return $('#invalid-current-age-error'); }
    get errorRetirementAge() { return $('#invalid-retirement-age-error'); }
    get errorCurrentIncome() { return $('#invalid-current-income-error'); }
    get errorCurrentSavings() { return $('#invalid-current-total-savings-error'); }
    get errorAnnualSavings() { return $('#invalid-current-annual-savings-error'); }
    get errorSavingsIncreaseRate() { return $('#invalid-savings-increase-rate-error'); }

    // Page Open
    public async open() {
        await super.open('');
    }

    // Actions

    public async fillRequiredFields(data: RetirementData) {
        await this.setInputValue(this.inputCurrentAge, data.currentAge);
        await this.setInputValue(this.inputRetirementAge, data.retirementAge);
        await this.setMaskedValue(this.inputCurrentIncome, data.currentAnnualIncome);
        await this.setMaskedValue(this.inputCurrentSavings, data.currentRetirementSavings);
        await this.setMaskedValue(this.inputAnnualSavings, data.currentRetirementContribution);
        await this.setMaskedValue(this.inputSavingsIncreaseRate, data.annualContributionIncrease);
    }

    public async fillOptionalIncomeFields(data: RetirementData) {
        if (data.spouseAnnualIncome) {
            await this.setMaskedValue(this.inputSpouseIncome, data.spouseAnnualIncome);
        }
    }

    public async setSocialSecurity(enable: boolean) {
        if (enable) {
            await this.clickElement(this.labelSocialSecurityYes);
        } else {
            await this.clickElement(this.labelSocialSecurityNo);
        }
    }

    public async fillSocialSecurityDetails(data: RetirementData) {
        await this.setSocialSecurity(true);

        // Wait for the first social security field to become visible
        const ssFields = await this.containerSocialSecurityFields;
        await ssFields[0].waitForDisplayed({ timeout: 5000 });
        if (data.relationshipStatus === 'Married') {
            await this.clickElement(this.labelMarried);
        }
        if (data.socialSecurityOverride) {
            await this.setMaskedValue(
                this.inputSocialSecurityOverride,
                data.socialSecurityOverride
            );
        }
    }

    public async adjustDefaultValues(data: RetirementData) {
        // Open the modal
        await this.clickElement(this.adjustDefaultValuesLink);
        // Wait for the modal and its first input to be ready
        const modal = await $('#default-values-modal');
        await modal.waitForDisplayed({ timeout: 10000 });

        await browser.waitUntil(async () => {
            const classList = await modal.getAttribute('class');
            return classList?.includes('show');
        }, { timeout: 5000, timeoutMsg: 'Modal did not finish animation' });
        await browser.pause(500);

        await this.additionalIncome.waitForDisplayed({ timeout: 5000 });
        await this.additionalIncome.waitForClickable({ timeout: 5000 });

        // Additional income during retirement
        if (data.additionalIncome !== undefined) {
            await this.setMaskedValue(this.additionalIncome, data.additionalIncome);
        }
        // Years retirement needs to last
        if (data.yearsRetirementNeedsToLast !== undefined) {
            await this.setInputValue(this.retirementDuration, data.yearsRetirementNeedsToLast);
        }
        // Post-retirement income increases with inflation
        if (data.postRetirementInflation !== undefined) {
            const radioId = data.postRetirementInflation ? 'include-inflation' : 'exclude-inflation';
            const radioLabel = await $(`label[for="${radioId}"]`);

            await radioLabel.waitForExist({ timeout: 5000 });
            await browser.execute((id) => {
                const el = document.querySelector(`label[for="${id}"]`) as HTMLElement;
                if (el) el.click();
            }, radioId);

            const radioButton = await $(`#${radioId}`);
            await browser.waitUntil(async () => await radioButton.isSelected(), {
                timeout: 5000,
                interval: 500,
                timeoutMsg: `Inflation radio button #${radioId} was not selected after click`
            });
        }
        // Percent of final annual income desired in retirement
        if (data.percentFinalIncomeDesired !== undefined) {
            await this.setMaskedValue(this.retirementAnnualIncome, data.percentFinalIncomeDesired);
        }
        // Pre-retirement investment return
        if (data.preRetirementInvestmentReturn !== undefined) {
            await this.setMaskedValue(this.preRetirementROI, data.preRetirementInvestmentReturn);
        }
        // Post-retirement investment return
        if (data.postRetirementInvestmentReturn !== undefined) {
            await this.setMaskedValue(this.postRetirementROI, data.postRetirementInvestmentReturn);
        }
        // Click "Save changes"
        await this.clickElement(this.saveButton);
        // Wait for modal to close
        await modal.waitForDisplayed({ timeout: 10000, reverse: true });
    }

    public async submitForm() {
        await this.clickElement(this.btnCalculate);

        // Wait for the results chart canvas to become visible.
        const resultsChart = await $('#results-chart');
        await resultsChart.waitForDisplayed({
            timeout: 20000,
            timeoutMsg: '#results-chart canvas did not appear after Calculate was clicked'
        });

        // Also wait for the result message text to be populated.
        await browser.waitUntil(async () => {
            const text = await this.resultMessage.getText();
            return text.trim().length > 0;
        }, {
            timeout: 10000,
            timeoutMsg: 'Result message not populated'
        });
    }
}

export default new CalculatorPage();
