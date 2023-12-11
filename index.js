import puppeteer from 'puppeteer';
import getEnv from './getenv.js';

(async () => {

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    await page.goto("about:blank");

    console.log("Loading website...");
    await page.goto("https://skeisvang-vgs.inschool.visma.no/");

    await page.waitForSelector("#login-with-feide-button");

    console.log(`Currently at: ${page.url()}`);

    if (page.url().indexOf("Login.jsp") !== -1) {
        await page.waitForSelector("#onetrust-accept-btn-handler");
        await page.click("#onetrust-accept-btn-handler");

        await new Promise(r => setTimeout(r, 1000));

        await page.click("#login-with-feide-button");
        await page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: 5000,
        });

        try {
            if (page.url().indexOf("idp.feide.no") !== -1) {
                console.log(`Logging in at ${page.url().slice(0, 99)}`);
                console.log(
                    `Index of idp.feide.no: ${page
                        .url()
                        .indexOf("idp.feide.no")}`
                );

                await page.waitForSelector("#username")
                await page.waitForSelector("#password")
                console.log("Logging in...");
                await page.type("#username", getEnv("username"));
                await page.type("#password", getEnv("password"));
                await page.click("#main > div.main > form > button");

                await page.waitForNavigation(page, {
                    waitUntil: "networkidle0",
                    timeout: 10000,
                })
            } else {
                throw `not at feide login page [${page.url()}]`;
            }
        } catch (error) {
            console.log(
                `Probably already logged in: ${page.url()}, Error: ${error}`
            );
        }
    }

    console.log("Getting cookies...");
    const cookies = await page.cookies();

    const jsession = cookies.find((cookie) => cookie.name === "session");

    console.log(`SESSION: ${jsession.value}`);
    
    let my_cookies = [{
        'name': 'session',
        'value': `${jsession.value}`,
        'domain': 'skeisvang-vgs.inschool.visma.no'
    }]
    
    await page.goto("about:blank");
    
    await page.setCookie(...my_cookies);
    
    await page.goto("https://skeisvang-vgs.inschool.visma.no/#/app/timeline/");

    await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 5000,
    });
    
    await page.waitForSelector("li.vsTimeline-line");

    let raw_assessments = await page.$$("li.vsTimeline-line");

    let assessments = [];

    raw_assessments.forEach(async el => {
        await el.waitForSelector('span');

        let span = await el.$('span');
        let span_value = await el.evaluate(el => el.textContent, span);

        let grade = await el.$('section > div.vsware-Timetable-Timeline-card > h1');
        let grade_value = await el.evaluate(el => el.textContent, grade);

        let info = await el.$('h4');
        let assessment_name = await el.evaluate(el => el.textContent, info);

        let infos = await el.$$('.vsware-Title-Subtitle');

        infos.forEach(
    })

    console.groupEnd();
})();
