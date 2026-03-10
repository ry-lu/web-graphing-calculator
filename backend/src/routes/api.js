const express = require('express');
const router = express.Router();
const mathController = require('../controllers/mathController');

router.post('/calculate', mathController.calculate);
router.post('/derivative', mathController.derivative);
router.post('/integral', mathController.integral);
router.post('/solve', mathController.solve);
router.post('/intersections', mathController.intersections);
router.post('/diffeq', mathController.diffeq);

module.exports = router;
