const express = require("express");
const router = express.Router();
const { initModels } = require("../models/initModels");
const { Op } = require("sequelize");

const models = initModels();

// 증권사 조회 (by search keyword)
router.get("/search", async (req, res, next) => {
  try {
    const firms = await models.Firm.findAll({
      where: {
        name: {
          [Op.like]: `%${req.query.keyword}%`,
        },
      },
    });
    res.json(firms);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "fail" });
    next(err);
  }
});

router.get("/getDetail/:firmId", async (req, res, next) => {
  try {
    console.log(req.params);
    const firms = await models.Firm.findOne({
      where: {
        id: req.params.firmId,
      },
    });
    console.log(firms);
    res.json(firms);
  } catch (err) {
    throw err;
  }
});

module.exports = router;
