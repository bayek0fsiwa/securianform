import { spawn } from 'node:child_process';

export const config: WebdriverIO.Config = {
    runner: 'local',
    tsConfigPath: './tsconfig.json',

    specs: [
        './src/specs/**/*.ts'
    ],
    exclude: [],

    maxInstances: 1,

    capabilities: [{
        browserName: 'chrome',
        acceptInsecureCerts: true
    }],

    logLevel: 'info',

    bail: 0,
    baseUrl: process.env.BASE_URL,
    waitforTimeout: 10000,

    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'jasmine',

    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            useCucumberStepReporter: false,
        }]
    ],

    jasmineOpts: {
        defaultTimeoutInterval: 60000,
        expectationResultHandler: function (_passed, _assertion) {}
    },

    afterTest: async function (_test, _context, { passed }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },

    onComplete: function () {
        const reportError = new Error('Could not generate Allure report');
        const generation = spawn('pnpm', ['exec', 'allure', 'generate', 'allure-results', '--clean'], {
            stdio: 'inherit',
            shell: true
        });

        generation.on('exit', (code: number) => {
            if (code !== 0) {
                return console.error(reportError);
            }
            console.log('Allure report successfully generated');
        });
    },
};
