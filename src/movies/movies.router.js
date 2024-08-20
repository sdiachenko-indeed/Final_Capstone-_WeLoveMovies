const router = require("express").Router();
const controller = require("./movies.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

const reviewsRouter = require("../reviews/reviews.router");
const theatersRouter = require("../theaters/theaters.router");

// nested router
router.use("/:movieId/reviews", controller.movieExists, reviewsRouter);
router.use("/:movieId/theaters", controller.movieExists, theatersRouter);

// other router for movies
router.route("/:movieId").get(controller.read).all(methodNotAllowed);
router.route("/").get(controller.list).all(methodNotAllowed);

module.exports = router;
