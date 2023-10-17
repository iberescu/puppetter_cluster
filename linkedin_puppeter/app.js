/**************************************/
/*********** Linkedin - Scrapper*******/
/**************************************/
const fastify = require('fastify');
const puppeteer = require( 'puppeteer' );
const fileSystem = require('fs');
const os = require('os');

const PORT = 4000;
const app = fastify();
let timeout = 1500000

app.post('/api/searchjobs', async (req, res) => {
  try {
    let data = req.body
    console.log(req.body.url)
    
    await loadCookie().then(async (result) => {
      await getJobSearchData(data).then(result => {
        let response = {
            msg: 'retrieved job search details',
            url: data.url,
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
async function getJobSearchData(arg) {
    let pMng = require('./libraries/PuppeteerManagerLinkedin')
    let puppeteerMng = new pMng.PuppeteerManagerLinkedin(arg)
    try {
      let followersCount = await puppeteerMng.scrapLinkedinJobs().then(result => {
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

  const path = 'cookiesLinkedin.json'
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

        let user = 'himanshu.rehani@yahoo.com';
        let pass = 'HarperLink$123';

        await page.goto('https://www.linkedin.com/login', {waitUntil: 'networkidle2', timeout: 0});
        await sleep(2000);

        await page.type('input[name="session_key"]', user);
        await page.type('input[name="session_password"]', pass);
        await page.click('button[type="submit"]');

        await page.waitForNavigation();
        
        const cookies = await page.cookies();
        await fileSystem.writeFileSync('cookiesLinkedin.json', JSON.stringify(cookies, null, 2));
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
console.log(`Linkedin Running on port: ${PORT}`);