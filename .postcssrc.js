// https://github.com/michael-ciniawsky/postcss-load-config
const path = require("path");
const root = __dirname;

module.exports = {
  "plugins": {
    "postcss-import": {
      resolve: (id, basedir, importOptions) => {
        if(id.startsWith("@/")){
          return path.join(root, "src", id.slice(2));
        }
        return id;
      },
    },
    "postcss-url": {},
    "postcss-simple-vars": {},
    "postcss-nested": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {}
  }
}
