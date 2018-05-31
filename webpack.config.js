module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    filename: "bennu.js",
    libraryTarget: 'commonjs2',
    library: 'bennu'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.ts$/, loader: "ts-loader" }
    ]
  }
};