const fs = require('fs');
const client = require('https');

class PuppeteerManager {
    constructor(args) {
        this.url = args.url;
        this.existingCommands = args.commands;
        this.getInstagramFollowers = 0;
        this.newPostUrl = args.imageUrl;
        this.message = '';
        this.captionText = args.captionText;
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

        const cookiesArr = require('../cookies.json');
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
            case "getFollowers":
                try {

                    let followersCount = null;
                    await page.waitForXPath('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/ul/li[2]/a/span');
                    const getFollowers = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/ul/li[2]/a/span');
                    followersCount = await page.evaluate(el => el.getAttribute('title'), getFollowers[0]);

                    /*console.log("Check", newFollowersCount);

                    const getInstagramFollowers = await page.$$eval("span", el => el.map(followers => followers.getAttribute("title")));
                    for(let i = 0; i < getInstagramFollowers.length; i++) {
                        if (getInstagramFollowers[i] !== null) {
                            followersCount = getInstagramFollowers[i];
                        }
                    }*/

                    this.getInstagramFollowers = followersCount;
                    return true
                } catch (error) {
                    console.log("error", error)
                    return false
                }
            case "createPost": {
                try {
                    
                    // Download temp image before creating a post
                    const imageDownloaded = await this.downloadImage(this.newPostUrl, './views/img/temp.jpg');
                    if(!imageDownloaded) {
                        this.postCreateMessage = "Image url is not correct";
                        return false;
                    }
                    
                    // step - 1 Create
                    const step1 = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[7]/div/div/a');
                    await page.evaluate(el => el.click(), step1[0]);

                    // wait to open create post popup
                    page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]');
                    
                    // Step - 2 Choose file
                    await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div/button');
                    const step2 = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div/button');
                    const [fileChoose1] = await Promise.all([
                      page.waitForFileChooser(),
                      await page.evaluate(el => el.click(), step2[0])
                      // page.evaluate(() => document.querySelector('.image-1').click()),
                    ]);
                    await fileChoose1.accept(['/opt/lampp/htdocs/instars/views/img/temp.jpg']);
                    await this.sleep('2000');

                    // Step - 2 Choose file
                    /*await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div/button');
                    const step2 = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div/button');
                    await page.evaluate(el => el.click(), step2[0]);
                    await this.sleep('2000');*/

                    // Step - 3 Crop 
                    await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[1]/div/div/div[3]/div/div');
                    const step3 = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[1]/div/div/div[3]/div/div');
                    await page.evaluate(el => el.click(), step3[0]);
                    await this.sleep('2000');

                    // Step - 4 Edit
                    await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[1]/div/div/div[3]/div/div');
                    const step4 = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[1]/div/div/div[3]/div/div');
                    await page.evaluate(el => el.click(), step4[0]);
                    await this.sleep('2000');

                    
                    // Add text before sharing the post
                    await page.waitForSelector('div[aria-label="Write a caption..."]');
                    await page.click('div[aria-label="Write a caption..."]');
                    
                    await page.keyboard.type(this.captionText, { delay: 100 });
                    await page.keyboard.press('Tab');
                    await this.sleep('2000');

                    
                    // Step - 5 Create new post - Share
                    await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[1]/div/div/div[3]/div/div');
                    const shareButton = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[1]/div/div/div[3]/div/div');
                    await page.evaluate(el => el.click(), shareButton[0]);
                    
                    await this.sleep('4000');
                    
                    this.message = "Post created successfully..!!";
                    return true;
                } catch (error) {
                    console.log("error", error)
                    return false
                }
            }
            case "readMessage": {
                try {
                    
                    //check for notification modal and close it
                    const notificationModal = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]')
                    const isNotificationPopUp = await page.evaluate(el => el.length, notificationModal)
                    
                    if (isNotificationPopUp) {
                        await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[3]/button[2]');
                        const closeNotificationModal = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[3]/button[2]')
                        await page.evaluate(el => el.click(), closeNotificationModal[0])
                    }
                    this.sleep('2000');
                    // /html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[5]/div/span/div/a
                    // click on message and move to message page
                    await page.waitForXPath('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[5]/div/span/div/a');
                    const checkMessage = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[5]/div/span/div/a');
                    page.evaluate(el => el.click(), checkMessage[0]);

                    // check for the unread messages
                    const unreadMessage = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/section/div/div/div/div[1]/div[1]/div/div[3]/div/div/div/div/div[2]/div/div[1]/div/div/div[3]/div/div/span');
                    page.evaluate(el => el.click(), unreadMessage[0]);
                    
                    
                    // wait for navigation
                    // page.waitForNavigation();


                    return true;

                } catch(error) {
                    console.log(error);
                    return false;
                }
            }
            case "sendMessage": {
                try {
                    //wait for the message button
                    await page.waitForXPath('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/div[1]/div[1]/div/div[2]/div');
                    const messageButton = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/div[1]/div[1]/div/div[2]/div');
                    await page.evaluate(el => el.click(), messageButton[0]);

                    //wait for navigation
                    page.waitForNavigation();

                    // wait for notification popup
                    await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]');
                    // close notification popup
                    await page.waitForXPath('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[3]/button[2]')
                    const buttonNotNow = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[3]/button[2]')
                    await page.evaluate(el => el.click(), buttonNotNow[0]);

                    await this.sleep('1000')

                    await page.waitForSelector('div[aria-describedby="Message"]');
                    await page.click('div[aria-describedby="Message"]');
                    await page.keyboard.type(command.message, { delay: 100 });
                    
                    await this.sleep('2000');

                    await page.waitForXPath('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/section/div/div/div/div[1]/div[2]/div/div/div/div/div/div[2]/div/div/div[2]/div/div/div[3]');
                    const sendMessage = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/section/div/div/div/div[1]/div[2]/div/div/div/div/div/div[2]/div/div/div[2]/div/div/div[3]');
                    const buttonName = await page.evaluate(el => el.click(), sendMessage[0]);

                    await this.sleep('2000')

                    this.message = "Message Sent";
                    return true;

                } catch(error) {
                    console.log(error);
                    return false;
                }
            }
            case "followProfile": {
                try {
                    await page.waitForXPath('html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/div[1]/div[1]/div/div[1]/button/div/div');
                    const followButton = await page.$x('html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/div[1]/div[1]/div/div[1]/button/div/div');
                    const button = await page.evaluate(el => el.textContent, followButton[0]);
                    
                    //Follow                     
                    if (button === "Follow") {
                        await page.waitForXPath('html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/div[1]/div[1]/div/div[1]/button/div/div');
                        const followButton = await page.$x('html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/div[1]/div[1]/div/div[1]/button/div/div');
                        await page.evaluate(el => el.click(), followButton[0]);

                        this.sleep(2000)

                        this.message = "Followed";
                        return true;
                    } else {
                        this.message = "Already Followed";
                        return false;
                    }
                } catch(error) {
                    console.log("error", error)
                    return false
                }
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async getIgFollowers() {
        await this.runPuppeteer()
        return this.getInstagramFollowers
    }

    async createInstagramPost() {
        await this.runPuppeteer()
        return this.message;
    }

    async instagramFollowUser() {
        await this.runPuppeteer()
        return this.message;
    }

    async instagramMessages() {
        await this.runPuppeteer()
        return this.message;
    }

    async downloadImage(url, filepath) {
        
        const urlChecker = new URL(url)
        if (urlChecker.protocol === "data:") {
            console.log("urlChecker.protocol",urlChecker.protocol)
            return false;
        }

        return new Promise((resolve, reject) => {
            client.get(url, (res) => {
                if (res.statusCode === 200) {
                    res.pipe(fs.createWriteStream(filepath))
                        .on('error', reject)
                        .once('close', () => resolve(filepath));
                } else {
                    // Consume response data to free up memory
                    res.resume();
                    // reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
                    return false;

                }
            });
        });
    }

    async deleteImage() {
        fs.unlink('fileToBeRemoved', function(err) {
            if(err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                console.info(`removed`);
            }
        });
    } 
}

module.exports = { PuppeteerManager }