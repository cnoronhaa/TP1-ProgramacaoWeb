import express from 'express';
import { mainController } from '../controllers/main.controller';
import { majorController } from '../controllers/major.controller';
import { userController } from '../controllers/user.controller';

const router = express.Router();

router.get('/', mainController.home);
router.get('/about', mainController.about);
router.get('/lorem/:count', mainController.lorem);
router.get('/hb1', mainController.hb1);
router.get('/hb2', mainController.hb2);
router.get('/hb3', mainController.hb3);
router.get('/hb4', mainController.hb4);

router.get('/major', majorController.list);
router.get('/major/create', majorController.createForm);
router.post('/major/create', majorController.create);
router.post('/major/:id/delete', majorController.remove);

router.get('/signup', userController.signupForm);
router.post('/signup', userController.signup);

export default router;