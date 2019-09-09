const axios = require('axios');

const getInformation = async (req, res) => {
  const { id } = req.query;
  if (!id && id !== 'undefined') {
    res.json({ status: 400, message: 'Bad Request' });
    return;
  }
  const vietStockURL = `https://dc.vietstock.vn/api/Search/SearchInVietstock?keySearch=${id}&currentPage=1&pageSize=2`;
  const resp = (await axios.post(vietStockURL, {})).data;
  const { data } = resp;
  if (data && data.length > 0) {
    res.json({
      status: 200,
      data: data.map(item => `https://vietstock.vn${item.URL}`),
    });
    return;
  }
  res.json({ status: 404, message: 'No Data' });
};

module.exports = { getInformation };
