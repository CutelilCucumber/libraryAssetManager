const { Router } = require("express");
const getController = require("../controllers/getLibController.js");
const publicRouter = Router();

publicRouter.get("/", getController.getPublicAssets);
publicRouter.get("/new/:id", getController.promoteAsset);

module.exports = publicRouter;