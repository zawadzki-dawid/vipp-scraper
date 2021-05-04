const puppeteer = require('puppeteer');

let products_offset = 0;

const getProductUrls = async (page, products_queue, csv_writer) => {

    const products_url = await page.$$eval('.product-list > li > a', (anchors) => {
        return anchors.map((anchor) => anchor.href)
    });

    const products_from_offset = products_url.slice(products_offset);

    products_offset = products_url.length;

    products_queue.push(products_from_offset, (csv_row) => {

        (async () => {
            await csv_writer.writeRecords(csv_row);
        })();

    });

    await page.evaluate(() => {
        const scroll_by_value = document.documentElement.scrollHeight -
                                document.documentElement.clientHeight;

        window.scrollTo({
            top: scroll_by_value,
            behavior: 'auto'
        });   

    });

    // Sometimes scrollBy doesn't scroll to proper position what makes scraper freeze.
    // Deviation variable helps to avoid such situations, by considering possible inaccuracy.
    const deviation = 100;

    const window_position = await page.evaluate(() => {
        return Promise.resolve(
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        );
    });

    const scroll_wait_cond = `window.pageYOffset >= ${window_position - deviation}`;

    await page.waitForFunction(scroll_wait_cond);

    await page.waitForSelector('.load-more', {hidden: true});

    const window_next_position = await page.evaluate(() => {
        return Promise.resolve(
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        );
    });

    if(window_position === window_next_position) {
        return;
    }

    return getProductUrls(page, products_queue, csv_writer);

}


const scrapPage = async (page_url, products_queue, csv_writer) => {

    const browser = await puppeteer.launch();
    const page    = await browser.newPage();

    await page.goto(page_url);

    await getProductUrls(page, products_queue, csv_writer);

    browser.close();
}


module.exports = scrapPage;