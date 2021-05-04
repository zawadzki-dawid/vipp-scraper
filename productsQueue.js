const asyncQueue = require('async/queue');
const cheerio    = require('cheerio');
const fetch      = require('node-fetch');

const scrapDataFromHTML = (body) => {

    const $ = cheerio.load(body);

    const product_name = $('.product-info__flag')
        .first()
        .find('h1')
        .text()
        .trim();

    const product_id = $('.product-info__flag')
        .first()
        .find('h4')
        .text()
        .trim();

    const product_desc = $('.product-info__flag')
        .first()
        .find('div.text')
        .text()
        .trim()
        .replace('\"', '');

    const product_price = $('#price-product')
        .text();

    const product_dimensions = $('#product-detail')
        .find('div:contains("Dimensions") + div > p')
        .text();

    const product_designer = $('#product-detail')
        .find('div:contains("Design") + div > p')
        .text();

    const product_material = $('#product-detail')
        .find('div:contains("Material") + div > p')
        .text();

    const product_colors = $('#edit-attributes-field-color')
        .find('option')
        .map((idx, el) => {
            return $(el).text().replace(' (OUT OF STOCK)', '');
        })
        .get()
        .join('/');

    const csv_row = [
        {
            'id': product_id,
            'name': product_name,
            'desc': product_desc,
            'designer': product_designer,
            'dimensions': product_dimensions,
            'colors': product_colors,
            'material': product_material
        }
    ];

    const photos_url = $('#module-product-info__gallery > ul')
        .find('img')
        .map((idx, el) => {
            return $(el).attr('src');
        })
        .get();
    

    const photo_objects = photos_url.map((url, idx) => {

        let photo_name = product_id.replace(' ', '_');

        if(idx === 0) {
            photo_name = `${photo_name}.jpg`;
        } else {
            photo_name = `${photo_name}_${idx}.jpg`;
        }

        return {
            url: url,
            name: photo_name
        }
    })
    
    return {
        csv_row: csv_row,
        photo_objects: photo_objects
    }

}


const createProductsQueue = (workers_number, photos_queue) => {

    return asyncQueue((url, callback) => {
        
        (async () => {
            
            const response = await fetch(url);
            const body     = await response.text();

            const {csv_row, photo_objects} = scrapDataFromHTML(body);
            
            photos_queue.push(photo_objects);

            callback(csv_row);

        })();

    }, workers_number);

}


module.exports = createProductsQueue;


