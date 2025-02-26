const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: 'http://127.0.0.1:5000',
  },

  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm-bundler.js', // Alias Vue to the ESM build with template compiler
      },
    },
  },

  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: JSON.stringify(true), // Enable Options API (default: true)
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // Disable devtools in production (default: false)
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false), // Disable hydration mismatch details
      });
      return definitions;
    });
  },
});
