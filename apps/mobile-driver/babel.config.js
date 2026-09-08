module.exports = function (api) {
  api.cache(true);
  return {
    // `jsxImportSource` es lo que hace que NativeWind pueda traducir `className`
    // a estilos; y `nativewind/babel` es un preset (no un plugin) en v4.
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
