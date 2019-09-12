const axios = require('axios');
const Promise = require('bluebird');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const getInformation = async (id) => {
  if (!id && id !== 'undefined') {
    return Promise.resolve([]);
  }
  const vietStockURL = `https://dc.vietstock.vn/api/Search/SearchInVietstock?keySearch=${id}&currentPage=1&pageSize=5`;
  const resp = (await axios.post(vietStockURL, {})).data;
  const { data } = resp;
  if (data && data.length > 0) {
    return Promise.resolve({
      data: data.map(item => {
        const dom = new JSDOM('<div>' + item.Content + '</div>');
        const content = dom.window.document.querySelector('div').textContent;
          return {
            link: `https://vietstock.vn${item.URL}`,
            linkthumb:
              item.HeadImageUrl ? item.HeadImageUrl:
              "https://page-photo-qr.zdn.vn/1564627440/284f8fddb4985dc60489.jpg",
            linktitle: item.Title.substring(0, 100),
            linkdes: content.substring(0, 500)
          };}),
    });
  }
  return Promise.resolve([]);
};

module.exports = { getInformation };