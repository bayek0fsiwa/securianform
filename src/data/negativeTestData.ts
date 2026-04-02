import data from './negativeData.json';


export interface NegativeTestData {
    scenario: string;
    currentAge: number;
    retirementAge: number;
    currentAnnualIncome: number;
    currentRetirementSavings: number;
    currentRetirementContribution: number;
    annualContributionIncrease: number;
    expectedError: string;
}

export const negativeDataList: NegativeTestData[] = data;
