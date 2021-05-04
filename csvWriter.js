const CsvWriter = require('csv-writer').createObjectCsvWriter;

const createCsvWriter = (csv_path) => {

    return CsvWriter({
        path: csv_path,
        append: true,
        header: [
            {
                id: 'id',
                title: 'Id'
            },
            {
                id: 'name',
                title: 'Name'
            },
            {
                id: 'desc',
                title: 'Desc'
            },
            {
                id: 'colors',
                title: 'Colors'
            },
            {
                id: 'designer',
                title: 'Designer'
            },
            {
                id: 'dimensions',
                title: 'Dimensions' 
            },
            {
                id: 'material',
                title: 'Material' 
            }
        ]
    });

}

module.exports = createCsvWriter;