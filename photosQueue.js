const asyncQueue = require('async/queue');
const fetch      = require('node-fetch');
const fs         = require('fs');


const createPhotosQueue = (output_dir, workers_number) => {

    return asyncQueue((photo_object, callback) => {

        const {url, name} = photo_object;
        const output_path = `${output_dir}/${name}`;

        (async () => {
            
            const response = await fetch(url);
            const buffer   = await response.buffer();

            fs.writeFile(output_path, buffer, () => {
                callback();
            });
            
        })();

    }, workers_number);
}

module.exports = createPhotosQueue;