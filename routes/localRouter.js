const { Router } = require("express");
const getController = require("../controllers/getLibController.js");
const postController = require("../controllers/postLibController.js");
const assetRouter = Router();

assetRouter.get("/", getController.getAllAssets);
assetRouter.get("/new", getController.newAssetForm);
assetRouter.get("/file/:id", getController.serveAsset);

assetRouter.post("/single", postController.addSingleAsset);
assetRouter.post("/multiple", postController.addDirectory);

//buttons instead of forms need to be get
assetRouter.get("/edit/:id", getController.editAssetForm);
assetRouter.get("/delete/:id", getController.removeAsset);

module.exports = assetRouter;