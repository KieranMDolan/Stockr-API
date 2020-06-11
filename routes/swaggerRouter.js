var express = require("express");
var router = express.Router();
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./swagger.yaml');

router.use('', swaggerUi.serve);
router.get('', swaggerUi.setup(swaggerDocument));

module.exports = router;