const puppeteer = require('puppeteer')
const { readFile, writeFile } = require('fs').promises

const screenshot = `screenshot.png`
const startLinc = 'https://sedeapl.dgt.gob.es/WEB_EXAM_AUTO/service/TiposExamenesServlet#'


async function scraping() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
    ]
  })
  const page = await browser.newPage()
  await page.goto(startLinc)
  await page.waitFor(3000)

  // go to a new page
  const pageTarget = page.target();
  await page.click('[title="ExamenB"]');
  const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget)
  const newPage = await newTarget.page();
  await newPage.waitFor(3000)
  //click english
  const linkInglés = await newPage.$x("//span[contains(text(), 'Inglés')]")
  if (linkInglés.length > 0) {
    await linkInglés[0].click();
  } else {
    throw new Error("Link not found");
  }
  await newPage.waitFor(2000)
  //press enter
  await newPage.click('[alt="Pulsar el boton para entrar en el Examen"]')
  await newPage.waitFor(2000)
  //press the finalist
  await newPage.click('#btnFinExamen');
  await newPage.waitFor(2000)
  //press the acceptor
  await newPage.click('[onclick="javascript: finalizarExamen()"]')
  await newPage.waitFor(2000)
  //load file
  let data = await readFile('data.json', { encoding: 'utf8' }).then((text) => {
    return JSON.parse(text)
  })

  // go around 30 questions
  for (let questionNumber = 1; questionNumber <= 30; questionNumber += 1) {
    const idCurrentQuestion = `#indPreg${questionNumber}`
    await newPage.waitForSelector(idCurrentQuestion)
    await newPage.click(idCurrentQuestion)
    await newPage.waitFor(2000)

    const currentQuestion = await newPage.evaluate(() => {
      const question = document.querySelector('#textoPreguntaElem').textContent
      const answers = Array.from(document.getElementsByClassName('arial16negro')).map(it => it.innerText)
      const tryAncwer = document.querySelector('*[src="../examen/img/boton_correcta.gif"]').getAttribute('name')[3]
      const imgLinc = 'https://sedeapl.dgt.gob.es' + document.querySelector('#imgPreguntaElem').getAttribute('src')
      return { question, answers, tryAncwer, imgLinc }
    })

    const isReplay = data.find((it) => it.question === currentQuestion.question)

    if (isReplay === undefined) {
      data.push(currentQuestion)
      const pageForImg = await browser.newPage()
      const viewSource = await pageForImg.goto(currentQuestion.imgLinc)
      const nameImg = currentQuestion.imgLinc.split('/').pop()
      await pageForImg.waitFor(2000)
      await writeFile(`images/${nameImg}`, await viewSource.buffer())
      pageForImg.close()
    }

    // const IMAGE_SELECTOR = '#tsf > div:nth-child(2) > div > div.logo > a > img'
    // let imageHref = await page.evaluate((sel) => {
    //   return document.querySelector(sel).getAttribute('src').replace('/', '')
    // }, IMAGE_SELECTOR)

    // console.log("https://www.google.com/" + imageHref);
    // const viewSource = await page.goto("https://www.google.com/" + imageHref)
    // fs.writeFile(".googles-20th-birthday-us-5142672481189888-s.png", await viewSource.buffer(), function (err) {
    //   if (err) {
    //     return console.log(err)
    //   }
    // }
  }

  await writeFile('data.json', JSON.stringify(data), { encoding: 'utf8' })

  await newPage.waitFor(2000)
  await newPage.screenshot({
    path: screenshot,
    fullPage: true
  })

  // other actions...
  // console.log('tick');

  await browser.close();
}
scraping()

