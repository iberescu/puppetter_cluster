const puppeteer = require( 'puppeteer' );
const fileSystem = require('fs');
const os = require('os');

class server {
  /**
   * Get user profile followes
   * 
   */ 
  async getFollowers(args, res) {
    const followersCount = await this.loadCookie().then(async (result) => {
        let data = args.body
        const resp = await this.getInstagramHandler(data).then(result => {
          let response = {
              msg: 'retrieved followers count',
              hostname: os.hostname(),
              url: args.body.url,
              InstagramFollowersCount: result
            }
          console.log('done', response);
          return response;
        })
        return resp;
      });
      return followersCount;
  }

  async getInstagramHandler(arg) {
    let pMng = require('./PuppeteerManager')
    let puppeteerMng = new pMng.PuppeteerManager(arg)
    try {
      let followersCount = await puppeteerMng.getIgFollowers().then(result => {
        return result
      })
      return followersCount;
    } catch (error) {
      console.log(error)
    }
  }
  /**
   * Create a new instagram post on profile
   * 
   */ 
  async createInstagramPost(args, res) {
    const createPostMessage = await this.loadCookie().then(async (result) => {
      let data = args.body
      const resp = await this.getInstagramCreatePostHandler(data).then(result => {
        let response = {
            msg: result
          }
        console.log('done', response);
        return response;
      })
      return resp;
    });
    return createPostMessage;
  }

  /**
   * create new post on Instagram 
   * @params image url, type, text
   * 
   */
  async getInstagramCreatePostHandler(arg) {
      let pMng = require('./PuppeteerManager')
      let puppeteerMng = new pMng.PuppeteerManager(arg)
      try {
        let followersCount = await puppeteerMng.createInstagramPost().then(result => {
          return result
        })
        return followersCount;
      } catch (error) {
        console.log(error)
      }
  }

  /**
   * Send & Read Message
   * 
   */ 
  async sendReadInstagramMessage(args, res) {
    const sendReadMessage = await this.loadCookie().then(async (result) => {
      let data = args.body
      const resp = await this.sendReadInstagramMessageHandler(data).then(result => {
        let response = {
            msg: result
          }
        console.log('done', response);
        return response;
      })
      return resp;
    });
    return sendReadMessage;
  }

  /**
 * @param 
 * Send & Read Message
 * 
 */ 
  async sendReadInstagramMessageHandler(arg){
    let pMng = require('./PuppeteerManager')
    let puppeteerMng = new pMng.PuppeteerManager(arg)
    try {
      let followersCount = await puppeteerMng.instagramMessages().then(result => {
        return result
      })
      return followersCount;
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Follow user profiles
   * 
   */ 
  async followInstagramUser(args, res) {
    const sendReadMessage = await this.loadCookie().then(async (result) => {
      let data = args.body
      const resp = await this.instagramFollowUserHandler(data).then(result => {
        let response = {
            msg: result
          }
        console.log('done', response);
        return response;
      })
      return resp;
    });
    return sendReadMessage;
  }

  /**
  * Method for Following 
  * instagram user profiles
  * 
  */ 
  async instagramFollowUserHandler(arg) {
  let pMng = require('./PuppeteerManager')
    let puppeteerMng = new pMng.PuppeteerManager(arg)
    try {
      let followersCount = await puppeteerMng.instagramFollowUser().then(result => {
        return result
      })
      return followersCount;
    } catch (error) {
      console.log(error)
    }
  }

  async loadCookie() {

    const path = './cookies.json'
    if (fileSystem.existsSync(path)) {
      return true;
    }

    let BROWSER;
    await puppeteer.launch( {
        headless : false,
        devtools : false,
        slowMo   : 0
      } ).then( async ( browser ) => {
          BROWSER = browser;
          return await browser.newPage();
      } ).then( ( page ) => {
          page.setViewport( {
              width  : 1366,
              height : 768
          } ).then( async () => {
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');

          let user = 'harperdavid405';
          let pass = 'Nethues$123';

          await page.goto('https://www.instagram.com/accounts/login/', {waitUntil: 'networkidle2', timeout: 0});
          await this.sleep(1000);

          await page.type('input[name="username"]', user);
          await page.type('input[name="password"]', pass);
          await page.click('button[type="submit"]');

          await page.waitForNavigation();
          
          const cookies = await page.cookies();
          await fileSystem.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
          await BROWSER.close();
        });
    });
    await this.sleep(12000);

    return true;
  }

  async sleep ( ms ) {
    return new Promise( resolve => setTimeout( resolve, ms ) );
  }
}

module.exports = { server }

/**************************************/
/*********** Digital ocean ************/
/**************************************/
const fastify = require('fastify');

const PORT = 8001;
const app = fastify();
let timeout = 1500000

app.post('/api/followers', async (req, res) => {
  try {
    let data = req.body
    console.log(req.body.url)
    
    await loadCookie().then(async (result) => {
      await getInstagramFollowerHandler(data).then(result => {
        let response = {
            msg: 'retrieved followers count',
            url: data.url,
            InstagramFollowersCount: result
          }
        console.log('done')
        res.send(response)
      })
    });
  } catch (error) {
    console.log(error)
  }
});

app.post('/api/createpost', async (req, res) => {
  try {
    let data = req.body
    console.log(req.body.url)
    
    await loadCookie().then(async (result) => {
      await getInstagramCreatePostHandler(data).then(result => {
        let response = {
            msg: result,
          }
        console.log('done')
        res.send(response)
      })
    });
  } catch (error) {
    console.log(error)
  }
});

app.post('/api/handleprofile', async (req, res) => {
  try {
    let data = req.body
    console.log(req.body.url)
    
    await loadCookie().then(async (result) => {
      await getInstagramCreatePostHandler(data).then(result => {
        let response = {
            msg: result,
          }
        console.log('done')
        res.send(response)
      })
    });
  } catch (error) {
    console.log(error)
  }
});

/**
 * Handle Messages in Instagram
 * Send or Read message
 * 
 */ 
app.post('/api/handleMessage', async (req, res) => {
  try {
    let data = req.body
    console.log(req.body.url)
    
    await loadCookie().then(async (result) => {
      await instagramMessageHandler(data).then(result => {
        let response = {
            msg: result,
          }
        console.log('done')
        res.send(response)
      })
    });
  } catch (error) {
    console.log(error)
  }
});

/**
 * scrap followers from Instagram 
 * @params url, type
 * 
 */
async function getInstagramFollowerHandler(arg) {
    let pMng = require('./PuppeteerManager')
    let puppeteerMng = new pMng.PuppeteerManager(arg)
    try {
      let followersCount = await puppeteerMng.getIgFollowers().then(result => {
        return result
      })
      return followersCount;
    } catch (error) {
      console.log(error)
    }
}

/**
 * create new post on Instagram 
 * @params image url, type, text
 * 
 */
async function getInstagramCreatePostHandler(arg) {
    let pMng = require('./PuppeteerManager')
    let puppeteerMng = new pMng.PuppeteerManager(arg)
    try {
      let followersCount = await puppeteerMng.createInstagramPost().then(result => {
        return result
      })
      return followersCount;
    } catch (error) {
      console.log(error)
    }
}

/**
 * Method for Following 
 * instagram user profiles
 * 
 */ 
async function instagramFollowUserHandler(arg) {
  let pMng = require('./PuppeteerManager')
    let puppeteerMng = new pMng.PuppeteerManager(arg)
    try {
      let followersCount = await puppeteerMng.instagramFollowUser().then(result => {
        return result
      })
      return followersCount;
    } catch (error) {
      console.log(error)
    }
}

/**
 * @param 
 * message @string userProfile @string
 * 
 */ 
async function instagramMessageHandler(arg){
  let pMng = require('./PuppeteerManager')
  let puppeteerMng = new pMng.PuppeteerManager(arg)
  try {
    let followersCount = await puppeteerMng.instagramMessages().then(result => {
      return result
    })
    return followersCount;
  } catch (error) {
    console.log(error)
  }
}
/**
 * load cookies
 * 
 * 
 */ 
async function loadCookie() {

  const path = './cookies.json'
  if (fileSystem.existsSync(path)) {
    return true;
  }

  let BROWSER;
  await puppeteer.launch( {
      headless : false,
      devtools : false,
      slowMo   : 0
    } ).then( async ( browser ) => {
        BROWSER = browser;
        return await browser.newPage();
    } ).then( ( page ) => {
        page.setViewport( {
            width  : 1366,
            height : 768
        } ).then( async () => {

        let user = 'harperdavid405';
        let pass = 'Nethues$123';

        await page.goto('https://www.instagram.com/accounts/login/', {waitUntil: 'networkidle2', timeout: 0});
        await sleep(1000);

        await page.type('input[name="username"]', user);
        await page.type('input[name="password"]', pass);
        await page.click('button[type="submit"]');

        await page.waitForNavigation();
        
        const cookies = await page.cookies();
        await fileSystem.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
        await BROWSER.close();
      });
  });
  await sleep(12000);

  return true;
}

function sleep(ms) {
  console.log(' running maximum number of browsers')
  return new Promise(resolve => setTimeout(resolve, ms))
}

app.listen({ port : PORT});
console.log(`Running on port: ${PORT}`);