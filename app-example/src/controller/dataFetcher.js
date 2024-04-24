const {busstopData} = require("../model/data")

async function getBusstopData(req, res) {
  try {
    const { rows } = await busstopData();
    res.json(rows);
  } catch (err) {
    console.error("Internal Server Error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {getBusstopData};
