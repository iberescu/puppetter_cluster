const fs = require('fs');
const client = require('https');

class PuppeteerManager {
    constructor(args) {
        this.url = args.url;
        this.existingCommands = args.commands;
        this.getInstagramFollowers = 0;
        this.newPostUrl = args.imageUrl;
        this.return = '';
        this.captionText = args.captionText;
        this.is_production = true;
    }

    async runPuppeteer() {
        const puppeteer = require('puppeteer');
        
        let commands = []
        commands = this.existingCommands
        /*const browser = await puppeteer.launch({
            headless: false,
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ],
            defaultViewport: null
        });*/

        // const this.is_production = process.env.NODE_ENV === 'production';
        
        const getBrowser = () =>
          this.is_production
            ? // Connect to browserless so we don't run Chrome on the same hardware in production
            puppeteer.connect({ 
                browserWSEndpoint:'wss://chrome.browserless.io?token=c0ea113f-d72e-4a3b-a3ec-71224200911e&headless=true&--window-size=1280,800&ignoreDefaultArgs=true&stealth',
                // browserWSEndpoint: 'wss://chrome.browserless.io?token=c0ea113f-d72e-4a3b-a3ec-71224200911e&headless=false',
                // slowMo: 1000, 
            })
            : // Run the browser locally while in development
            puppeteer.launch({
                headless: false,
                args: [
                    "--no-sandbox",
                    "--disable-gpu",
                ],
                defaultViewport: null
            });

        const browser = await getBrowser();
        
        let page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');
        
        const cookiesArr = require('../cookies.json');
        for (let cookie of cookiesArr) {
            await page.setCookie(cookie);
        }

        await page.goto(this.url);
        
        /*await page.setViewport({
            width: 1920,
            height: 1080
        })*/

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

                    /*let followersCount = null;
                    await page.waitForXPath('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/ul/li[2]/a/span');
                    const getFollowers = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/header/section/ul/li[2]/a/span');
                    followersCount = await page.evaluate(el => el.getAttribute('title'), getFollowers[0]);
                    
                    const getInstagramFollowers = await page.$$eval("span", el => el.map(followers => followers.getAttribute("title")));
                    for(let i = 0; i < getInstagramFollowers.length; i++) {
                        if (getInstagramFollowers[i] !== null) {
                            followersCount = getInstagramFollowers[i];
                        }
                    }*/

                    let followersCount = await page.evaluate(() => {
                        return document.querySelectorAll('ul > li')[1].querySelectorAll('span')[0].getAttribute('title');
                    });

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
                    await page.waitForXPath('//span[contains(text(), "Create")]');
                    const step_1 = await page.$x('//span[contains(text(), "Create")]');
                    await page.evaluate(el => el.click(), step_1[0]);
                    console.log("Step-1 Completed")

                    // wait to open create post popup
                    await page.waitForXPath('//div[contains(text(), "Create new post")]');
                    
                    // Step - 2 Choose file
                    const selectButton = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div/button')
                    const [fileChoose] = await Promise.all([
                        //page.waitForSelector('button'),
                        page.waitForFileChooser(),
                        page.evaluate(el => el.click(), selectButton[0])
                    ]);
                    await fileChoose.accept(['/opt/lampp/htdocs/instars/views/img/temp.jpg']);
                    await this.sleep('2000');
                    console.log("Step-2 Completed")
                    /*Code with changed selector*/
                    
                    /*New Code for crop*/
                    await page.evaluate(() => {
                        const divs = document.querySelectorAll('div')
                        divs.forEach((e, k) => {
                            if(e.textContent == "Next"){
                                e.click();
                            }
                        })
                        return "Next";
                    })
                    await this.sleep('2000');
                    console.log("Step-3 Completed")
                    /*New Code for crop*/
                    
                    /*New Code for Edit*/
                    await page.evaluate(() => {
                        const divs = document.querySelectorAll('div')
                        divs.forEach((e, k) => {
                            if(e.textContent == "Next"){
                                e.click();
                            }
                        })
                        return "Next";
                    })
                    await this.sleep('2000');
                    console.log("Step-4 Completed")
                    /*New Code for Edit*/
                    
                    // Add text before sharing the post
                    if (!this.is_production) {
                        await page.waitForSelector('div[aria-label="Write a caption..."]');
                        await page.click('div[aria-label="Write a caption..."]');
                    } else {
                        const writeCaption = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[2]/div/div/div/div[2]/div[1]/div[1]')
                        await page.evaluate(el => el.click(), writeCaption[0]);
                    }
                    
                    await page.keyboard.type(this.captionText, { delay: 100 });
                    await page.keyboard.press('Tab');
                    await this.sleep('2000');

                    /*New Code for Create new post - Share (Step-5)*/
                    await page.evaluate(() => {
                        const divs = document.querySelectorAll('div')
                        divs.forEach((e, k) => {
                            if(e.textContent == "Share"){
                                e.click();
                            }
                        })
                        return "Share";
                    })
                    await this.sleep('2000');
                    console.log("Step-5 Completed")
                    /*New Code for Create new post - Share*/
                    
                    await this.sleep('2500');
                    
                    this.return = "Post created successfully..!!";
                    return true;
                } catch (error) {
                    console.log("error", error)
                    return false
                }
            }
            case "readMessage": {
                try {
                    
                    // check for notification modal and close it
                    /*await page.waitForXPath('//span[contains(text(),"Turn on notifications")]')
                    const notificationModal = await page.$x('//span[contains(text(),"Turn on notifications")]');
                    const isNotificationPopUp = await page.evaluate(el => el.length, notificationModal)

                    if (isNotificationPopUp) {
                        await page.waitForXPath('//button[contains(text(),"Not Now")]')
                        const closeNotificationModal = await page.$x('//button[contains(text(),"Not Now")]');
                        await page.evaluate(el => el.click(), closeNotificationModal[0])
                    }*/

                    // check for notification modal and close it
                    let notificationModal;
                    if (this.is_production) {
                        notificationModal = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[2]/span[1]');
                    } else {
                        await page.waitForXPath('//span[contains(text(),"Turn on notifications")]')
                        notificationModal = await page.$x('//span[contains(text(),"Turn on notifications")]');
                    }
                    
                    const isNotificationPopUp = await page.evaluate(el => el.length, notificationModal);
                    if (isNotificationPopUp) {
                        const closeNotificationModal = await page.$x('//button[contains(text(),"Not Now")]');
                        await page.evaluate(el => el.click(), closeNotificationModal[0])
                    }
                    this.sleep('2000');

                    // check if any unread message from homepage
                    let unreadAccounts = await page.evaluate(() => {
                        const label = document.querySelectorAll('a[href="/direct/inbox/"]')[0].getAttribute('aria-label');
                        const newLabel = label.split(" ");
                        if (newLabel[0] == "Direct") {
                            return newLabel[3];
                        } else {
                            return false;
                        }
                    });
                    this.sleep('2000');

                    // proceed for read messages if any
                    if (unreadAccounts > 0) {
                        
                        /*Old code to open message section - Working fine with puppeteer headful*/
                        // await page.waitForSelector('a[href="/direct/inbox/"]');
                        // await page.click('a[href="/direct/inbox/"]');
                        // await this.sleep('1000');
                        /*Old code to open message section - Working fine with puppeteer headful*/

                        // this section will open message - new code
                        await page.evaluate(() => {
                            return document.querySelectorAll('a[href="/direct/inbox/"]')[0].click();
                        });
                        this.sleep('2000');
                        
                        //this section check's the instance is on message page
                        const checkMessages = await page.$x("//span[contains(text(),'Your messages')]")
                        const checkMessageSection = await page.evaluate(el => el.length, checkMessages)
                        this.sleep('2000');
                        if (checkMessageSection === 0) {
                            return false;
                        }

                        // this section will return total number of accounts old code
                        const accountCount = await page.$x('//div[@role="listitem"]');
                        const accountCountNumber = await page.evaluate(el => el.length, accountCount);
                        this.sleep('2000');
                        // this section will return total number of accounts old code
                        
                        let accountMessages = [];
                        let userMessages = [];
                        

                        /*New code for check*/
                        const checkValue = await page.$x('/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/section/div/div/div/div[1]/div/div[1]/div/div[3]/div/div/div/div/div[2]/div');
                        const parsedHtml = await page.evaluate(el => el, checkValue);
                        const parsedValues = await page.evaluate((parsedHtml) => {
                            const checkParsedHtml = parsedHtml[0].querySelectorAll('span');
                            for(let i = 0; i < checkParsedHtml.length; i++){
                                if(checkParsedHtml[i].getAttribute('data-visualcompletion') == 'ignore') {
                                    console.log('found')
                                }
                                return checkParsedHtml;
                            }
                        }, parsedHtml) 
                        console.log(parsedValues); return;
                        /*New code for check*/

                        /*New code*/
                        // await page.waitForXPath('//div[contains(@role,"listitem")]//span[contains(@data-visualcompletion,"ignore")]');
                        const unreadAccounts = await page.$x('//div[contains(@role,"listitem")]//span[contains(@data-visualcompletion,"ignore")]');
                        const unreadAccountMessages = await page.evaluate(el => el.length, unreadAccounts);
                        console.log("unreadAccountMessages", unreadAccountMessages);
                        // for (var i = 0; i < unreadAccountMessages; i++) {
                        //     console.log(i);
                        // }
                        return true;
                        /*New code*/

                        for (var i = 0; i < accountCountNumber; i++) {
                            
                            let unreadMessage = await page.evaluate((i) => {
                                return document.querySelectorAll('div[role="listitem"]')[i].outerText//.querySelectorAll('div > div > div')[0].querySelectorAll('div > div > div')[12].querySelectorAll('span').length;
                            }, i)

                            console.log("check unread messages", unreadMessage);

                            /*if (unreadMessage) {
                                const getAccountUserName = await page.evaluate((i) => {
                                    return document.querySelectorAll('div[role="listitem"]')[i].innerText.split('\n');
                                }, i)

                                const userName = getAccountUserName[0];
                                
                                userMessages.push(userName);

                                const accountButton = await page.$x('//div[@role="listitem"]');
                                await page.evaluate(el => el.click(), accountButton[i])
                                await this.sleep('2000')
                                
                                // const getMessageCount = await page.$x('//span[contains(text(), "'+ userName +'")]');
                                const getMessageCount = await page.$x('//div[@dir="auto"]');
                                const getMessageCounts = await page.evaluate(el => el.length, getMessageCount);
                                
                                await page.waitForSelector('div[role="row"]', {
                                    visible: true,
                                });
                                this.sleep('2000');
                                    
                                const rows = await page.evaluate(() => {
                                    return document.querySelectorAll('div[role="row"]').length;
                                });
                                
                                let newMessages = [];
                                for (var j = rows - 1; j >= 0; j--) {
                                    const checkUser = await page.evaluate((j, userName) => {
                                        return document.querySelectorAll('div[role="row"]')[j].innerText.startsWith(userName)
                                    }, j, userName)
                                    let messages;
                                    if (checkUser) {
                                        messages = await page.evaluate((j) => {
                                            return document.querySelectorAll('div[role="row"]')[j].querySelectorAll('div[dir="auto"]')[0].innerText;
                                        }, j)

                                        newMessages.push(messages);
                                    }

                                    if (newMessages.length == command.messageCount) {
                                        break;
                                    }
                                }

                                accountMessages.push(newMessages);
                                await this.sleep('2000')

                                userMessages.push(newMessages);
                            }*/

                        }
                        return;    
                        console.log("User messages", userMessages);
                        this.return = accountMessages; 
                        return true
                    } else {
                        this.return = "No unread message.";
                        return true;
                    }

                } catch(error) {
                    console.log(error);
                    return false;
                }
            }
            case "sendMessage": {
                try {
                    await page.waitForXPath('//div[contains(text(),"Message")]')
                    const messageButton = await page.$x('//div[contains(text(),"Message")]');
                    await page.evaluate(el => el.click(), messageButton[0])
                    await this.sleep('2000');

                    let notificationModal;
                    if (this.is_production) {
                        notificationModal = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[2]/span[1]');
                    } else {
                        await page.waitForXPath('//span[contains(text(),"Turn on notifications")]')
                        notificationModal = await page.$x('//span[contains(text(),"Turn on notifications")]');
                    }
                    
                    const isNotificationPopUp = await page.evaluate(el => el.length, notificationModal)
                    if (isNotificationPopUp) {
                        const closeNotificationModal = await page.$x('//button[contains(text(),"Not Now")]');
                        await page.evaluate(el => el.click(), closeNotificationModal[0])
                    }
                    
                    await page.waitForSelector('div[aria-describedby="Message"]');
                    await page.click('div[aria-describedby="Message"]');
                    await page.keyboard.type(command.message, { delay: 100 });
                    
                    await this.sleep('1000');

                    // const sendMessage = await page.$x('//div[contains(text(),"Send")]')
                    const sendMessage = await page.$x('//div[contains(text(),"Send")]');
                    const getSendButtonLength = await page.evaluate(el => el.length, sendMessage);
                    const buttonName = await page.evaluate(el => el.click(), sendMessage[getSendButtonLength-1]);
                    await this.sleep('2000');
                    
                    this.return = "Message Sent";
                    return true;

                } catch(error) {
                    console.log(error);
                    return false;
                }
            }
            case "followProfile": {
                try {
                    await page.waitForXPath('//div[contains(text(),"Follow")]');
                    const followButton = await page.$x('//div[contains(text(),"Follow")]');
                    const button = await page.evaluate(el => el.textContent, followButton[0]);
                    
                    //Follow                     
                    if (button === "Follow") {
                        await page.waitForXPath('//div[contains(text(),"Follow")]');
                        const followButton = await page.$x('//div[contains(text(),"Follow")]');
                        await page.evaluate(el => el.click(), followButton[0]);

                        this.sleep(2000)

                        this.return = "Followed";
                        return true;
                    } else {
                        this.return = "Already Followed";
                        return false;
                    }
                } catch(error) {
                    console.log("error", error)
                    return false
                }
            }
            case "scrollWall": {
                try {
                    const z_scroll_number = command.scrollNumber;
                    const x_wait_after_each_scroll = command.waitTimeAfterScroll * 1000; //convert api seconds into milliseconds
                    const y_postToLike = command.postToLike;

                    const postToLikePerScroll = Math.ceil(y_postToLike / z_scroll_number);
                    
                    // check for notification modal and close it
                    await page.waitForXPath('//span[contains(text(),"Turn on notifications")]')
                    const notificationModal = await page.$x('//span[contains(text(),"Turn on notifications")]');
                    const isNotificationPopUp = await page.evaluate(el => el.length, notificationModal)
                    
                    if (isNotificationPopUp) {
                        await page.waitForXPath('//button[contains(text(),"Not Now")]')
                        const closeNotificationModal = await page.$x('//button[contains(text(),"Not Now")]');
                        await page.evaluate(el => el.click(), closeNotificationModal[0])
                    }

                    await this.sleep(1000);

                    const elem = await page.$('main > div');
                    const boundingBox = await elem.boundingBox();
                    console.log("postToLikePerScroll", postToLikePerScroll)
                    console.log(boundingBox);
                    let likePosts = 0;
                    for (var i = 0; i < z_scroll_number; i++) {
                        await page.mouse.move(
                          boundingBox.x + boundingBox.width / 2,
                          boundingBox.y + boundingBox.height / 2
                        );
                        // scroll
                        await page.mouse.wheel({deltaY: 700});
                        
                        await this.sleep('2000')
                        
                        // like post
                        if (postToLikePerScroll == 1) {
                            await page.evaluate((i) => {
                                return document.querySelectorAll('article')[i].querySelectorAll('section')[0].querySelectorAll('span > button')[0].click();
                            }, i)
                        } else {
                            for (var j = 0; j < postToLikePerScroll; j++) {
                                console.log(likePosts)
                                await page.evaluate((likePosts) => {
                                    // return document.querySelectorAll('article')[likePosts].querySelectorAll('section')[0].querySelectorAll('span > button')[0].click();
                                    return document.querySelectorAll('article')[likePosts].querySelector('div').children[2].querySelector('div').children[0].querySelector('div > span').querySelectorAll('div')[0].click();
                                }, likePosts)

                                likePosts++;
                                // console.log(likePosts)
                            }
                        }
                        
                        // wait for x seconds after each scroll
                        await this.sleep(x_wait_after_each_scroll);
                    }
                    
                    await this.sleep('2000');
                    this.return = "Page scrolled " + z_scroll_number + " number of times. With " + x_wait_after_each_scroll + " milliseconds wait time after each scroll";
                    return true;
                } catch( error ) {
                    console.log("error", error);
                    return false;
                }
            }
            case "readPost": {
                try {
                    
                } catch ( error ) {
                    console.log("error", error);
                    return false;
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
        return this.return;
    }

    async instagramFollowUser() {
        await this.runPuppeteer()
        return this.return;
    }

    async instagramMessages() {
        await this.runPuppeteer()
        return this.return;
    }

    async scrollWall() {
        await this.runPuppeteer()
        return this.return;   
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