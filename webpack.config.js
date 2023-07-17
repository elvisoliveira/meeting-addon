const sharp = require('sharp');
const package = require('./package.json');

const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');

const ICON_SIZES = [16, 24, 32, 48, 64, 96, 128]

function copyPluginIconPatterns () {
    const res = ICON_SIZES.map(size => {
        return {
            from: 'icon.svg',
            to: `icon-${size}.png`,
            async transform (content) {
                return sharp(content).resize(size).png().toBuffer()
            }
        }
    })
    return res
}

function modify(buffer) {
    let manifest = JSON.parse(buffer.toString());
    manifest.version = package.version;
    manifest.description = package.description;
    ICON_SIZES.forEach((size) => {
        let entry = {};
        entry[size] = `icon-${size}.png`;
        manifest.icons = Object.assign(entry, manifest.icons || {});
    });
    return JSON.stringify(manifest, null, 2);
}

module.exports = async function (env, argv) {
    let config = {
        entry: {
            style: './src/popup.scss'
        },
        output: {
            filename: "[name].bundle.js"
        },
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: { name: '[name].min.css'}
                        },
                        'sass-loader'
                    ]
                }
            ]
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: './src/popup.html' },
                    {
                        from: './manifest.v2.json',
                        to: 'manifest.json',
                        transform(content) {
                            return modify(content)
                        }
                    },
                    ...copyPluginIconPatterns()
                ]
            }),
            new ESLintPlugin()
        ]
    };
    ['content', 'popup'].forEach((file) => {
        config.entry[`${file}`] = `./src/${file}.js`;
    });
    return config;
};
