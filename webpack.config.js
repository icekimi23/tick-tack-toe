const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    entry: './frontend/js/index.js',
    output: {
        filename: './server/public/js/index.js'
    },
    devtool: 'source-map',
    watch: (NODE_ENV === 'development' ? true : false)
};