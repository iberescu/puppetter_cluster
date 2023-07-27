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
                    
                    // date posted
                    /*await page.waitForXPath('//button[contains(text(), "Date posted")]');
                    const getDatePostButton = await page.$x('//button[contains(text(), "Date posted")]');
                    await page.evaluate(el => el.click(), getDatePostButton[0]);*/

                    await page.waitForSelector('div[aria-label="Date posted filter. Clicking this button displays all Date posted filter options."]');
                    await page.click('div[aria-label="Date posted filter. Clicking this button displays all Date posted filter options."]');
                    this.sleep(2000);

                    //type
                    await page.waitForSelector('div[aria-label="On-site/remote filter. Clicking this button displays all On-site/remote filter options."]');
                    await page.click('div[aria-label="On-site/remote filter. Clicking this button displays all On-site/remote filter options."]');
                    this.sleep(2000);
                    
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