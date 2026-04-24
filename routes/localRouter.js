const { Router } = require("express");
const localRouter = Router();
const {
  getLibrary,
  getAssetForm,
  serveAsset,
  addSingleAsset,
  addDirectory,
  deleteAsset
} = require("../controllers/localController.js");

localRouter.get("/", getLibrary);
localRouter.get("/new", getAssetForm);
localRouter.get("/file/:id", serveAsset);
localRouter.get("/:id/edit", getAssetForm);

localRouter.post("/single", addSingleAsset);
localRouter.post("/multiple", addDirectory);
localRouter.post("/:id/edit", addSingleAsset);
localRouter.post("/:id/delete", deleteAsset);

module.exports = localRouter;