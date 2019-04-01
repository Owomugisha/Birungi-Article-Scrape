module.exports = function(app) {
    app.get("/", (req, res) => {
        res.send(__dirname + "/../public/index.html");
    })
}