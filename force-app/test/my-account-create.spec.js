import Login from 'salesforce-pageobjects/helpers/pageObjects/login';

const { SF_URL, SF_USERNAME, SF_PASSWORD } = process.env;

describe('POC: create Account via App Launcher', () => {
    it('1. logs in (enter MFA code by hand if prompted)', async () => {
        await browser.url(SF_URL);
        const login = await utam.load(Login);
        await login.login(SF_USERNAME, SF_PASSWORD); // method name unverified

        // Wait up to 3 minutes: gives you time to type the MFA code
        const waffle = await $('.slds-icon-waffle');
        await waffle.waitForDisplayed({
            timeout: 180000,
            timeoutMsg: 'Lightning home not reached: login or MFA incomplete',
        });
    });

    it('2. opens Accounts from the App Launcher', async () => {
        await (await $('.slds-icon-waffle')).click();
        const search = await $('input[placeholder*="Search apps"]');
        await search.waitForDisplayed({ timeout: 30000 });
        await search.setValue('Accounts');
        const accountsLink = await $('a[data-label="Accounts"]');
        await accountsLink.waitForClickable({ timeout: 30000 });
        await accountsLink.click();
    });

    it('3. clicks New on the Accounts list', async () => {
        const newBtn = await $('a[title="New"]');
        await newBtn.waitForClickable({ timeout: 60000 });
        await newBtn.click();
    });

    it('4. fills the mandatory field and saves', async () => {
        const nameInput = await $('input[name="Name"]');
        const nextBtn = await $('button=Next');

        // Some orgs show a "choose record type" step first
        await browser.waitUntil(
            async () => (await nameInput.isDisplayed()) || (await nextBtn.isDisplayed()),
            { timeout: 30000, timeoutMsg: 'New Account form did not appear' },
        );
        if (await nextBtn.isDisplayed()) {
            await nextBtn.click();
        }

        await nameInput.waitForDisplayed({ timeout: 30000 });
        await nameInput.setValue('UTAM POC ' + Date.now());
        await (await $('button[name="SaveEdit"]')).click();

        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/Account/'),
            { timeout: 30000, timeoutMsg: 'Account record page not reached after Save' },
        );
    });
});