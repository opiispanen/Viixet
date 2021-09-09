const path = require('path')
const webpack = require('webpack')

module.exports = {
    configureWebpack: {
        externals: {
        },
        resolve: {
            alias: {
              '@Viixet': path.resolve(__dirname, './src/Viixet/'),
            },
            extensions: ['*', '.js', '.vue', '.json']
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    VIIXET: JSON.stringify('Welcome to Viixer Vue-Express project!')
                }
            })
        ]
    }
  }