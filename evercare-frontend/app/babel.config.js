// babel.config.js  ← create at project root
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],  // add plugins here
  };
};
