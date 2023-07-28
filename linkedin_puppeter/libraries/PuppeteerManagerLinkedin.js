const fs = require('fs');
const client = require('https');

class PuppeteerManagerLinkedin {
    constructor(args) {
        this.url = args.url;
        this.existingCommands = args.commands;
        this.jobTitle = args.jobTitle;
        this.location = args.location;
        this.type = args.type;
        this.date_posted = args.date_posted;
        this.return = '';
    }

    async runPuppeteer() {
        const puppeteer = require('puppeteer');
        
        let commands = []
        commands = this.existingCommands
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ],
            defaultViewport: null
        });

        let page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');
        
        const cookiesArr = require('../cookiesLinkedin.json');
        for (let cookie of cookiesArr) {
            await page.setCookie(cookie);
        }

        await page.goto(this.url);
        
        await this.sleep(6000)

        let timeout = 6000
        let commandIndex = 0
        while (commandIndex < commands.length) {
            try {
                await this.executeCommand(commands[commandIndex], page)
                await this.sleep(1000)
            } catch (error) {
                console.log(error)
                break
            }
            commandIndex++
        }
        console.log('done')
        await browser.close();
    }

    async executeCommand(command, page) {
        switch (command.type) {
            case "searchJobs":
                try { 
                    /*Start populating fields first*/
                    //click in title field and add title of job
                    await page.waitForSelector('input[aria-label="Search by title, skill, or company"]');
                    await page.click('input[aria-label="Search by title, skill, or company"]');
                    await this.sleep(2000);

                    await page.keyboard.type(this.jobTitle, { delay: 100 });
                    await this.sleep(2000);

                    //click in location field and add location of job
                    await page.waitForSelector('input[aria-label="City, state, or zip code"]');
                    await page.click('input[aria-label="City, state, or zip code"]');
                    await this.sleep(2000);

                    const input = await page.$('input[aria-label="City, state, or zip code"]');
                    await input.click({ clickCount: 3 });
                    await this.sleep(2000);

                    await page.keyboard.type(this.location, { delay: 100 });
                    await this.sleep(2000);

                    //click on search button
                    await page.waitForXPath('//button[text()="Search"]');
                    const searchButton = await page.$x('//button[text()="Search"]');
                    await page.evaluate(el => el.click(), searchButton[0]);
                    await this.sleep(2000);

                    // date posted
                    await page.waitForXPath('//button[text()="Date posted"]');
                    const getDatePostButton = await page.$x('//button[text()="Date posted"]');
                    await page.evaluate(el => el.click(), getDatePostButton[0]);

                    await page.waitForXPath('//span[text()= "'+this.date_posted+'"]');
                    const selectedDatePosted = await page.$x('//span[text()= "'+this.date_posted+'"]');
                    await page.evaluate(el => el.click(), selectedDatePosted[0]);

                    // select date filter result
                    await page.waitForXPath('/html/body/div[5]/div[3]/div[4]/section/div/section/div/div/div/ul/li[3]/div/div/div/div[1]/div/form/fieldset/div[2]/button[2]');
                    const selectDatePostedResult = await page.$x('/html/body/div[5]/div[3]/div[4]/section/div/section/div/div/div/ul/li[3]/div/div/div/div[1]/div/form/fieldset/div[2]/button[2]');
                    await page.evaluate(el => el.click(), selectDatePostedResult[0]);
                    await this.sleep(4000);
                    
                    //type 
                    await page.waitForXPath('//div[@data-basic-filter-parameter-name="workplaceType"]//button[@aria-label="On-site/remote filter. Clicking this button displays all On-site/remote filter options."]');
                    const getWorkPlaceTypeButton = await page.$x('//div[@data-basic-filter-parameter-name="workplaceType"]//button[@aria-label="On-site/remote filter. Clicking this button displays all On-site/remote filter options."]');
                    await page.evaluate(el => el.click(), getWorkPlaceTypeButton[0]);
                    await this.sleep(2000);

                    await page.waitForXPath('//span[text()= "'+this.type+'"]');
                    const selectedWorkingType = await page.$x('//span[text()= "'+this.type+'"]');
                    await page.evaluate(el => el.click(), selectedWorkingType[0]);
                    await this.sleep(2000);

                    // select type filter result
                    await page.waitForXPath('/html/body/div[5]/div[3]/div[4]/section/div/section/div/div/div/ul/li[7]/div/div/div/div[1]/div/form/fieldset/div[2]/button[2]');
                    const selectTypeResult = await page.$x('/html/body/div[5]/div[3]/div[4]/section/div/section/div/div/div/ul/li[7]/div/div/div/div[1]/div/form/fieldset/div[2]/button[2]');
                    await page.evaluate(el => el.click(), selectTypeResult[0]);
                    await this.sleep(6000);
                    
                    this.return = "Data found..!!";
                    return true
                } catch (error) {
                    console.log("error", error)
                    return false
                }
            
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async scrapLinkedinJobs() {
        await this.runPuppeteer()
        return this.return;
    }
}

module.exports = { PuppeteerManagerLinkedin }