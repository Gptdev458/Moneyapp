module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Optional but recommended for React Native
      'react-native-reanimated/plugin',
    ],
  };
}; 