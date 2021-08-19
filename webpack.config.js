module.exports = (env) => {
    return require(`./webpack.config.${env.mode}.js`);
}