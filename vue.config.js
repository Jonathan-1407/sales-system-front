module.exports = {
  transpileDependencies: ["vuetify"],
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = "Sales System";
      return args;
    });
  },
  pwa: {
    name: "Sales System",
    short_name: "SS",
    themeColor: "#3f51b5",
    msTileColor: "#3f51b5",
    appleMobileWebAppCache: "yes",
    manifestOptions: {
      background_color: "#ffffff"
    }
  }
};
