import data from './retirementData.json';


export interface RetirementData {
    currentAge: number;
    retirementAge: number;
    currentAnnualIncome: number;
    spouseAnnualIncome?: number;
    currentRetirementSavings: number;
    currentRetirementContribution: number;
    annualContributionIncrease: number;
    socialSecurityIncome: boolean;
    relationshipStatus?: string;
    socialSecurityOverride?: number;
    additionalIncome?: number;
    yearsRetirementNeedsToLast?: number;
    postRetirementInflation?: boolean;
    percentFinalIncomeDesired?: number;
    preRetirementInvestmentReturn?: number;
    postRetirementInvestmentReturn?: number;
}

export const sampleDataList: RetirementData[] = data;