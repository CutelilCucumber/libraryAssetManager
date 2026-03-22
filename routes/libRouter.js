const { Router } = require("express");
const libController = require("../controllers/libController");
const assetRouter = Router();

assetRouter.get("/", libController.getAllAssets);
// assetRouter.get("/tags", libController.getAllTags);

module.exports = assetRouter;
