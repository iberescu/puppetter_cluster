const fs = require('fs');

class PuppeteerManagerLinkedin {
    constructor(args) {
        this.url = args.url;
        this.existingCommands = args.commands;
        this.jobTitle = args.jobTitle;
        this.location = args.location;
        this.type = args.type;
        this.date_posted = args.date_posted;
        this.return = '';
        this.postData = {};
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

                    for (const types of this.type) {
                        await page.waitForXPath('//span[text()= "'+ types +'"]');
                        const selectedWorkingType = await page.$x('//span[text()= "'+ types +'"]');
                        await page.evaluate(el => el.click(), selectedWorkingType[0]);
                        await this.sleep(2000);
                    }
                    
                    // select type filter result
                    await page.waitForXPath('/html/body/div[5]/div[3]/div[4]/section/div/section/div/div/div/ul/li[7]/div/div/div/div[1]/div/form/fieldset/div[2]/button[2]');
                    const selectTypeResult = await page.$x('/html/body/div[5]/div[3]/div[4]/section/div/section/div/div/div/ul/li[7]/div/div/div/div[1]/div/form/fieldset/div[2]/button[2]');
                    await page.evaluate(el => el.click(), selectTypeResult[0]);
                    await this.sleep(4000);

                    const searchResultCount = await page.evaluate(() => {
                        return document.querySelectorAll('.jobs-search-results-list > ul > li').length;
                    });

                    // get total pages 
                    const totalPageCount = await page.evaluate(() => {
                        return document.querySelectorAll('.jobs-search-results-list__pagination > ul > li').length;
                    })

                    for (var i = 2; i <= totalPageCount; i++) {

                        let jobs = [];
                        const searchResultCount = await page.evaluate(() => {
                            return document.querySelectorAll('.jobs-search-results-list > ul > li').length;
                        });
                        //scrap job data 
                        for (var j = 0; j < searchResultCount; j++) {
                                
                            try{
                                //get data from each job listed 
                                const job_details = await page.evaluate((j) => {
                                    document.querySelectorAll('.jobs-search-results-list > ul > li')[j].querySelector('div > div > div > a').click();
                                }, j);
                                await this.sleep(1000);

                                // check if hiring team available or not
                                const checkHiringTeam = await page.evaluate(() => {
                                    return document.querySelector('div > .hirer-card__hirer-information > a');
                                });
                                await this.sleep(1000);

                                if (checkHiringTeam !== null) {
                                    this.dataSent = true;
                                    let jobDetails = {};

                                    /*const hiringTeam = await page.evaluate(() => {
                                        const hiringTeamProfile = document.querySelectorAll('div > .hirer-card__hirer-information > a')[0].getAttribute('href');
                                        const hirerName = document.querySelectorAll('div > .hirer-card__hirer-information > a > span')[0].outerText

                                        return hirerName + hiringTeamProfile;

                                    });*/

                                    // get contact first name
                                    const firstName = await page.evaluate(() => {
                                        const name = document.querySelector('div > .hirer-card__hirer-information > a > span').innerText;
                                        const splitNameData = name.split(",");
                                        const getFullName = splitNameData[0];

                                        const getName = getFullName.split(" ");
                                        const firstName = getName[0];

                                        return firstName;
                                    })
                                    jobDetails.firstname = firstName;
                                    // await this.sleep(1000);

                                    // get contact last name
                                    const lastName = await page.evaluate(() => {
                                        const name = document.querySelector('div > .hirer-card__hirer-information > a > span').innerText;
                                        const splitNameData = name.split(",");
                                        const getFullName = splitNameData[0];

                                        const getName = getFullName.split(" ");
                                        const lastName = getName[1];

                                        return lastName;
                                    })
                                    jobDetails.lastname = lastName;
                                    // await this.sleep(1000);

                                    //get contact linkedin url
                                    const contactUrl = await page.evaluate(() => {
                                        return document.querySelectorAll('div > .hirer-card__hirer-information > a')[0].href;
                                    })
                                    jobDetails.linkedin_url = contactUrl;
                                    // await this.sleep(1000);

                                    // get industry
                                    jobDetails.industry = "";

                                    // go to contact detail page
                                    await page.evaluate(() => {
                                        document.querySelector('div > .hirer-card__hirer-information > a').click();
                                    });
                                    await this.sleep(4000);
                                    
                                    // get contact details from the profile page
                                    // await page.waitForXPath('/html/body/div[5]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/div[2]/span[1]');
                                    // const getLocationDesc = await page.$x('/html/body/div[5]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/div[2]/span[1]');
                                    // const locationDesc = await page.evaluate(el => el.innerText, getLocationDesc[0]);
                                    // const contactPersonLocation = locationDesc;// locationDesc.split(",");
                                    const contactPersonLocation = await page.evaluate(() => {
                                        return document.querySelector('div > .pv-text-details__left-panel > span.text-body-small').innerText
                                    });
                                    await this.sleep(2000);
                                    
                                    // back to job list page
                                    await page.goBack();

                                    // code for company and country details
                                    await page.waitForXPath('/html/body/div[5]/div[3]/div[4]/div/div/main/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div[1]/div[2]');
                                    const getJobDesc = await page.$x('/html/body/div[5]/div[3]/div[4]/div/div/main/div/div[2]/div/div[2]/div[1]/div/div[1]/div/div[1]/div[1]/div[2]');
                                    const jobDesc = await page.evaluate(el => el.innerText, getJobDesc[0]);
                                    const jobCompanyCountry = jobDesc.split("·");
                                    // await this.sleep(1000);

                                    // get job location
                                    jobDetails.location = contactPersonLocation;

                                    // hiring team job profile in company
                                    const job_title = await page.evaluate(() => {
                                        return document.querySelector('div > .hirer-card__hirer-information  > .linked-area > .hirer-card__hirer-job-title').innerText;
                                    })
                                    jobDetails.job_title = job_title;
                                    // await this.sleep(1000);

                                    //get job title
                                    await page.waitForXPath('//div[@data-job-details-events-trigger]//h2[text()]');
                                    const getJobName = await page.$x('//div[@data-job-details-events-trigger]//h2[text()]');
                                    const jobName = await page.evaluate(el => el.innerText, getJobName[0]);
                                    jobDetails.hr_job_title = jobName;
                                    // await this.sleep(1000);

                                    // get job linkedin url
                                    await page.waitForXPath('//div[@data-job-details-events-trigger]//a[@href]');
                                    const getJobUrl = await page.$x('//div[@data-job-details-events-trigger]//a[@href]');
                                    const hr_job_linkedin_url = await page.evaluate(el => el.href, getJobUrl[0]);
                                    jobDetails.hr_job_linkedin_url = hr_job_linkedin_url;
                                    // await this.sleep(1000);

                                    // get country
                                    jobDetails.country = this.location; //jobCompanyCountry[1];
                                    
                                    // get company
                                    jobDetails.company = jobCompanyCountry[0];

                                    // get contact phone
                                    jobDetails.phone = "";

                                    // get phone country code
                                    jobDetails.country_code = "";

                                    // get country code prefix
                                    jobDetails.country_code_prefix = "";

                                    // get contact emails
                                    jobDetails.emails = []; 

                                    // get job details added
                                    jobs.push(jobDetails);
                                    // await this.sleep(1000);
                                }
                                // scroll down to pagination button
                                await page.evaluate(() => {
                                    return document.querySelectorAll('.jobs-search-results-list')[0].scrollBy(0, 150);
                                });
                                await this.sleep(1000);
                            } catch(err) {
                                console.log(err);
                            }
                        }
                        
                        // send data to API if job details are available
                        if (jobs.length > 0) {
                            fs.appendFileSync('./data.txt', JSON.stringify(jobs, null, 2));
                            this.postData.user_id = 21;
                            this.postData.data = jobs;
                            await this.sendData(this.postData);
                            //console.log(this.postData);
                        } else {
                            console.log("No job data");
                        }

                        await page.evaluate((i) => {
                            document.querySelectorAll('.jobs-search-results-list__pagination > ul > li')[i].querySelector('button').click();
                            return true;
                        }, i);
                        await this.sleep(4000);

                    }
                    
                    return true;
                    this.sleep(4000);
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

    /**
     * send data to end point
     * @param json
     */  
    async sendData(postData) {
        
        console.log("Post Data", postData);
        const data = JSON.stringify(postData);
        const https = require('https');
        const options = {
            hostname: 'testapp.leadmaker.io',
            port: 443,
            path: '/api/crawljobs',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Set the appropriate Content-Type header
            }
        }; 

        const req = https.request(options); 
        
        req.on('response', function(response) {
            let responseData = '';
            
            response.on('data', function(chunk) {
                responseData += chunk;
            });

            response.on('end', function() {
                //write reponse on file
                fs.appendFileSync('./data.txt', JSON.stringify(responseData, null, 2));
                console.log("Response Data:", responseData);
            });
        });

        req.write(data);

        

        // End the request
        req.end();

    }
}

module.exports = { PuppeteerManagerLinkedin }