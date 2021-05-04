const createProductsQueue = require('./productsQueue');
const createPhotosQueue   = require('./photosQueue');
const createCsvWriter     = require('./csvWriter');
const argParser           = require('minimist')
const scrapPage           = require('./puppeteer');
const fs                  = require('fs');


const products_queue_workers_num = 150;
const photos_queue_workers_num = 150;
const page_url = 'https://vipp.com/en/products';
const csv_columns_names = [
    {
        id: 'Id',
        name: 'Name',
        desc: 'Description',
        colors: 'Colors',
        designer: 'Designer',
        dimensions: 'Dimensions',
        material: 'Material' 
    }
]


const argv = argParser(process.argv, {
    default: {
        p: 'products.csv',
        o: 'output/'
    }
});


try{

    fs.unlinkSync(argv.p);

} catch(err) {

    console.log(`File ${argv.p} doesen\'t exists!`);

}

try{

    fs.mkdirSync(argv.o);

} catch(err) {

    console.log(`Directory ${argv.o} already exists!`);

}

const photos_queue = createPhotosQueue(argv.o, photos_queue_workers_num);
const products_queue = createProductsQueue(products_queue_workers_num, photos_queue);
const csv_writer = createCsvWriter(argv.p);



csv_writer.writeRecords(csv_columns_names, scrapPage(page_url, products_queue, csv_writer));

