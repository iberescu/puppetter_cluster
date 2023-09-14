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
                browserWSEndpoint:'wss://chrome.browserless.io?token=c0ea113f-d72e-4a3b-a3ec-71224200911e&headless=true&--window-size=1280,800&--start-fullscreen&ignoreDefaultArgs=false&keepalive=600000',
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
                try { // working for both browserless/puppeteer

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
            case "createPost": { // working for both browserless/puppteer
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
                    // const getPopUp = await page.$x('//div[contains(text(), "Create new post")]');
                    // const popUpName = await page.evaluate(el => el.textContent, getPopUp[0]);
                    // console.log(popUpName);
                    // return true;
                    await this.sleep(4000);
                    // Step - 2 Choose file
                    
                    /*const buttonBubble = await page.$$eval('button[type="button"]').filter(element => element.innerText.includes('Select From Computer'));
                    const newButtonBubble = await buttonBubble.filter(element => element.innerText.includes('Select From Computer'))
                    console.log(buttonBubble); return;*/

                    /*const selectButton = await page.$$('button[type="button"]').filter(element => element.innerText.includes('Select From Computer'))*/
                    
                    /*const selectButton = await page.evaluate(() => {
                        document.querySelectorAll('button[type="button"]').forEach((e) => {
                            const p = e.filter(element => element.innerText.includes('Select From Computer'));
                            return p;
                        })
                    })*/

                    /* const selectButton = await page.evaluate(() => {
                        const val = [...document.querySelectorAll('button')]
                                    .filter(element => 
                                      element.innerText.includes('Select From Computer')
                                    )
                        return val;
                    }) */
                    /*await page.waitForSelector('button[type="button"]');
                    const selectButton = await page.evaluate(() => {
                        const buttons = document.querySelectorAll('button[type="button"]');
                        return buttons[0].textContent;
                        for (var i = 0; i <  ; i--) {
                            Things[i]
                        }

                        let buttonValue = [];
                        document.querySelectorAll('button').forEach((e, k) => {
                            buttonValue.push(k);
                            if (e.textContent == "Select From Computer" || e.textContent == "Select from computer") {
                                buttonValue = k;   
                            }
                        })
                        return buttonValue;
                    });
                    console.log(selectButton); return true;*/

                    // const selectButton = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div/button')

                    // working fine with puppeteer headful mode
                    let selectButton;
                    if (this.is_production) {
                        await page.waitForXPath('//button[contains(text(), "Select from computer")]');
                        selectButton = await page.$x('//button[contains(text(), "Select from computer")]');
                    } else {
                        await page.waitForXPath('//button[contains(text(), "Select From Computer")]');
                        selectButton = await page.$x('//button[contains(text(), "Select From Computer")]');
                    }

                    const [fileChoose] = await Promise.all([
                        //page.waitForSelector('button'),
                        page.waitForFileChooser(),
                        page.evaluate(el => el.click(), selectButton[0])
                    ]);
                    await fileChoose.accept(['/opt/lampp/htdocs/instars/views/img/temp.jpg']);
                    await this.sleep('4000');
                    console.log("Step-2 Completed")
                    /*Code with changed selector*/
                    
                    /*New Code for crop*/
                    
                    // const stepName = await page.$x('//div[contains(text(), "Crop")]');
                    // const currentStep = await page.evaluate(el => el.textContent, stepName[0]);
                    // console.log(currentStep);
                    // return true;
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
                    // await page.waitForXPath('//div[contains(text(), "Edit")]');
                    await page.evaluate(() => {
                        const divs = document.querySelectorAll('div')
                        divs.forEach((e, k) => {
                            if(e.textContent == "Next"){
                                e.click();
                            }
                        })
                        return "Next";
                    })
                    await this.sleep('6000');
                    console.log("Step-4 Completed")
                    /*New Code for Edit*/
                    
                    // Add text before sharing the post
                    if (!this.is_production) {
                        await page.waitForSelector('div[aria-label="Write a caption..."]');
                        await page.click('div[aria-label="Write a caption..."]');
                    } else {
                        await page.waitForXPath('//div[contains(text(), "Create new post")]');
                        const getCurrentSection = await page.$x('//div[contains(text(), "Create new post")]');
                        const sectionName = await page.evaluate(el => el.textContent, getCurrentSection[0])

                        console.log(sectionName); 
                        return true;

                        // await page.waitForSelector('div[aria-label="Write a caption..."]');
                        // await page.click('div[aria-label="Write a caption..."]');

                        // await page.waitForXPath('//span[contains(text(), "harperdavid405")]');
                        // const getUserName = await page.$x('//span[contains(text(), "harperdavid405")]');
                        // const getName = await page.evaluate(el => el.textContent, getUserName[0]);
                        // console.log(getName); return;
                        // const writeCaption = await page.$x('/html/body/div[8]/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[2]/div/div/div/div[2]/div[1]/div[1]');
                        // await page.evaluate(el => el.click(), writeCaption[0]);
                        //const writeCaption = await page.$x('/html/body/div[2]/div/div/div[3]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[2]/div/div/div/div[2]/div[1]/div[1]')
                        // await page.waitForXPath('//div[contains(text(), "Write a caption...")]');
                        // const writeCaption = await page.$x('//div[contains(text(), "Write a caption...")]');
                        // await page.evaluate(el => el.click(), writeCaption[0]);
                        // const values = await page.evaluate(() => {
                        //     let value = [];
                        //     document.querySelectorAll('div').forEach((e) => {
                        //         value.push(e);
                        //     });
                        //     return value;
                        // })
                        // console.log(values) 
                        // return true;

                        const sectionSelector = await page.evaluate(() => {
                            let selectorName;
                            const divs = document.querySelectorAll('div');
                            divs.forEach((e, k) => {
                                if(e.textContent == "Write a caption..."){
                                    // e.click();
                                    selectorName = e.textContent;
                                }
                            })
                            // return "Next";
                            return selectorName;
                        })

                        console.log(sectionSelector);
                        return true;
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
            case "readMessage": { // sorted for browserless/puppeteer
                try {
                    
                    // check for notification modal and close it - step 1
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

                    // check if any unread message from homepage step 2
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
                        
                        // this section will open message - new code
                        await page.evaluate(() => {
                            return document.querySelectorAll('a[href="/direct/inbox/"]')[0].click();
                        });
                        await this.sleep('2000');
                        
                        // this section will return total number of accounts old code
                        const accountCount = await page.$x('//div[@role="listitem"]');
                        const accountCountNumber = await page.evaluate(el => el.length, accountCount);
                        this.sleep('2000');
                        // this section will return total number of accounts old code
                        
                        // code working fine till here

                        let accountMessages = [];
                        let userMessages = [];
                        
                        /*New code - code 1*/
                        //const unreadAccounts = await page.$x('//div[contains(@role,"list")]');
                        //const unreadAccountMessages = await page.evaluate(el => el.length, unreadAccounts);
                        let getAccounts = await page.evaluate(() => {
                            return document.querySelectorAll('div[role="listitem"]').length;
                        })
                        for (var i = 0; i < getAccounts; i++) {
                            let unreadMessage = await page.evaluate((i) => {
                                // return document.querySelectorAll('div[role="listitem"]')[i].querySelectorAll('').length;
                                return document.querySelectorAll('div[role="listitem"]')[i].querySelectorAll('div:nth-child(3)')[2].querySelectorAll('span').length
                            }, i)
                            console.log("Get unread messages", unreadMessage);
                        }
                        console.log("Length", getAccounts);
                        /*New code - code 1*/

                        return true;
                        //console.log("unreadAccountMessages", unreadAccountMessages);
                        for (var i = 0; i < unreadMessage; i++) {
                            
                            let unreadMessage = await page.evaluate((i) => {
                                return document.querySelectorAll('div[role="listitem"]')[i].querySelectorAll('span[data-visualcompletion = "ignore"]').length;//querySelectorAll('div > div > div')[0].querySelectorAll('div > div > div')[12].querySelectorAll('span').length;
                            }, i)

                            console.log("check unread messages", unreadMessage);

                            if (unreadMessage) {
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
                            }

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
            case "sendMessage": { // sorted for browserless/puppeteer(headful)
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
            case "followProfile": { // sorted for browserless/puppeteer
                try {
                    // await page.waitForXPath('//div[contains(text(),"Follow")]');
                    const followButton = await page.$x('//div[contains(text(),"Follow")]');
                    const button = await page.evaluate(el => el.textContent, followButton[0]);
                    
                    //Follow                     
                    if (button === "Follow") {
                        // await page.waitForXPath('//div[contains(text(),"Follow")]');
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
            case "scrollWall": { // working on
                try {
                    const z_scroll_number = command.scrollNumber;
                    const x_wait_after_each_scroll = command.waitTimeAfterScroll * 1000; //convert api seconds into milliseconds
                    const y_postToLike = command.postToLike;

                    const postToLikePerScroll = Math.ceil(y_postToLike / z_scroll_number);
                    
                    /* Start check for notification modal and close it - step 1 */
                    const notificationModal = await page.evaluate(() => {
                        return document.querySelector('div[role="dialog"]').querySelector('span').textContent;
                    })

                    /*let notificationModal = "";
                    if (this.is_production) {
                        notificationModal = await page.evaluate(() => {
                            return document.querySelector('div[role="dialog"]').querySelector('span').textContent;
                        })
                    } else {
                        // await page.waitForXPath('//span[contains(text(),"Turn on notifications")]')
                        // notificationModal = await page.$x('//span[contains(text(),"Turn on notifications")]');
                        notificationModal = await page.evaluate(() => {
                            return document.querySelector('div[role="dialog"]').querySelector('span').textContent;
                        })
                    }*/
                    
                    if (notificationModal == 'Turn on Notifications' || notificationModal == 'Turn on notifications') {
                        /*if (this.is_production) {
                            await page.evaluate(() => {
                                document.querySelector('div[role="dialog"]').querySelectorAll('button')[1].click()
                            })
                        } else {
                            const closeNotificationModal = await page.$x('//button[contains(text(),"Not Now")]');
                            await page.evaluate(el => el.click(), closeNotificationModal[0]);
                        }*/
                        await page.evaluate(() => {
                            document.querySelector('div[role="dialog"]').querySelectorAll('button')[1].click()
                        })
                    }
                    await this.sleep(1000);
                    /* End check for notification modal and close it - step 1 */
                    console.log("check");
                    await page.waitForSelector('section > main > div', { timeout: 5_000 });
                    const elem = await page.$('section > main > div');
                    const boundingBox = await elem.boundingBox();
                    
                    console.log("postToLikePerScroll", postToLikePerScroll)
                    console.log(boundingBox);

                    let likePosts = 0;
                    for (var i = 0; i < z_scroll_number; i++) {
                        
                        /*await page.evaluate(() => {
                            document.querySelectorAll('div > section > main div')[0].scrollBy(0, 200);
                        })*/

                        await page.mouse.move(
                          boundingBox.x + boundingBox.width / 2,
                          boundingBox.y + boundingBox.height / 2
                        );
                        // scroll
                        await page.mouse.wheel({deltaY: 600});
                        
                        await this.sleep('2500')
                        
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
                            }
                        }
                        
                        // wait for x seconds after each scroll
                        await this.sleep(x_wait_after_each_scroll);
                    }
                    
                    await this.sleep('2000');
                    console.log("Page scrolled " + z_scroll_number + " number of times. With " + x_wait_after_each_scroll + " milliseconds wait time after each scroll");
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