module.exports = function (api) {
  api.cache(true);
  
  const presets = ['module:@react-native/babel-preset'];
  const plugins = [];
  
  if (process.env.WEBPACK_BUILD) {
    presets.push('@babel/preset-react', '@babel/preset-typescript');
    plugins.push('react-native-web');
  }
  
  return {
    presets,
    plugins,
  };
};
