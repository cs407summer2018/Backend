var appRouter = function (app) {
  app.get("/", function(req, res) {
    res.status(200).send("Welcome Purdue Lab Stats!");
  });
}

module.exports = appRouter;
