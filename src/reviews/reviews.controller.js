const service = require("./reviews.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const methodNotAllowed = require("../errors/methodNotAllowed");
const { column } = require("../db/connection");

async function reviewExists(request, response, next) {
  // TODO: Write your code here
  // console.log(`request params: ${JSON.stringify(request.params)}`);

  const review = await service.read(request.params.reviewId);
  // console.log("review: ", review);

  if (review) {
    response.locals.review = review;
    return next();
  }

  next({
    status: 404,
    message: `Review cannot be found.`,
  });
}

async function destroy(request, response) {
  // TODO: Write your code here
  const { review } = response.locals;
  await service.destroy(review.review_id);
  response.sendStatus(204);
}

async function list(request, response) {
  // TODO: Write your code here
  const data = await service.list(request.params.movieId);
  // console.log("------ reviews -----------------");
  // console.log("reviews: ", data);
  // console.log("type: ", typeof data); // Object ... since Array is also Object
  // console.log("type: ", Array.isArray(data)); // true
  const formattedData = data.map((review) => ({
    review_id: review.review_id,
    content: review.content,
    score: review.score,
    created_at: review.created_at,
    updated_at: review.updated_at,
    critic_id: review.critic_id,
    movie_id: review.movie_id,
    critic: {
      critic_id: review.critic_id,
      preferred_name: review.preferred_name,
      surname: review.surname,
      organization_name: review.organization_name,
      created_at: review.created_at,
      updated_at: review.updated_at,
    },
  }));
  // console.log("------ formatted reviews -----------------");
  // console.log("formatted reviews: ", formattedData);
  // console.log("type: ", typeof formattedData); // Object ... since Array is also Object
  // console.log("type: ", Array.isArray(formattedData)); // true
  response.json({ data: formattedData });
}

function hasMovieIdInPath(request, response, next) {
  if (request.params.movieId) {
    return next();
  }
  methodNotAllowed(request, response, next);
}

function noMovieIdInPath(request, response, next) {
  if (request.params.movieId) {
    return methodNotAllowed(request, response, next);
  }
  next();
}

async function update(request, response) {
  // TODO: Write your code here
  // console.log("-----------------");
  // console.log("req.body.data: ", request.body.data);

  const updatedReview = {
    ...response.locals.review,
    ...request.body.data,
    review_id: response.locals.review.review_id,
  };
  // console.log("updatedReview: ", updatedReview);
  const data = await service.update(updatedReview);
  // console.log("---- data after update --------------");
  // console.log(data);
  response.json({ data });
}

module.exports = {
  destroy: [
    noMovieIdInPath,
    asyncErrorBoundary(reviewExists),
    asyncErrorBoundary(destroy),
  ],
  list: [hasMovieIdInPath, asyncErrorBoundary(list)],
  update: [
    noMovieIdInPath,
    asyncErrorBoundary(reviewExists),
    asyncErrorBoundary(update),
  ],
};