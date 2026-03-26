const { Router } = require("express");
const libController = require("../controllers/libController");
const assetRouter = Router();

assetRouter.get("/", libController.getAllAssets);
assetRouter.get("/new", libController.getAllTags);
assetRouter.get("/file/:id", libController.serveAsset);

module.exports = assetRouter;
