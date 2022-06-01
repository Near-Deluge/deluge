module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          assert: require.resolve("assert"),
          buffer: require.resolve("buffer"),
          console: require.resolve("console-browserify"),
          constants: require.resolve("constants-browserify"),
          crypto: require.resolve("crypto-browserify"),
          events: require.resolve("events"),
        //   http: require.resolve("stream-http"),
        //   https: require.resolve("https-browserify"),
          os: require.resolve("os-browserify/browser"),
          path: require.resolve("path-browserify"),
          process: require.resolve("process/browser"),
          stream: require.resolve("stream-browserify"),
          string_decoder: require.resolve("string_decoder"),
          sys: require.resolve("util"),
          url: require.resolve("url"),
          util: require.resolve("util"),
        },
      },
    },
  },
};
