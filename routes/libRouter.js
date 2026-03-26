const { Router } = require("express");
const getController = require("../controllers/getLibController");
const postController = require("../controllers/postLibController");
const assetRouter = Router();

assetRouter.get("/", getController.getAllAssets);
assetRouter.get("/new", getController.getAllTags);
assetRouter.get("/file/:id", getController.serveAsset);

assetRouter.post("/single", postController.addSingleAsset);
assetRouter.post("/multiple", postController.addDirectory);

module.exports = assetRouter;