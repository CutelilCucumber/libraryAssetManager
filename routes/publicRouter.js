const { Router } = require("express");
const publicRouter = Router();
const { isAdmin } = require("../middleware")
const {
  getLibrary,
  serveAsset,
  promoteAsset,
  removeFromPublic,
  deleteAsset
} = require('../controllers/publicController');

publicRouter.get('/', getLibrary)
publicRouter.get('/file/:id', serveAsset);
publicRouter.post('/add/:id', promoteAsset);
publicRouter.post('/:id/remove', removeFromPublic);
publicRouter.post('/:id/delete', isAdmin, deleteAsset);

module.exports = publicRouter;