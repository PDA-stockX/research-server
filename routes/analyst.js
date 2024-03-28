const express = require("express");
const router = express.Router();
const { initModels } = require("../models/initModels");

const models = initModels();

router.get("/checkReport/:analId", async (req, res, next) => {
  try {
    const response = await models.Report.findAll({
      where: { analystId: req.params.analId },
    });
    res.json(response);
  } catch (err) {
    throw err;
  }
});

// 애널리스트 조회 (by search keyword)
router.get("/:analId", async (req, res, next) => {
  try {
    const analInfo = await models.Analyst.findOne({
      include: [
        {
          model: models.Firm,
          as: "firm",
          attributes: ["name"],
        },
      ],
      where: { id: req.params.analId },
    });
    res.json(analInfo);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "fail" });
    next(err);
  }
});
module.exports = router;
