/*eslint-disable */
const axios = require('axios');

const baseURL =
  'http://wong-trading.com/';

const instance = axios.create({
  baseURL
});

export function getTransaction(currency, stock) {
    return instance.get('/apivn.php', {
        params: {
            client: "jptung",
            stock: `${currency},${stock}`
        }
    })
}


export function getTransactionHistory (stock, startDate) {
    let params = {
        client: "jptung",
        history: stock
    }
    if (startDate) {
        params = {
            ...params,
            startDate
        }
    }
    return instance.get('/apivn.php', {
        params
    })
}

export function getOHLCV (eod) {
    return instance.get('/apivn.php', {
        params: {
            client: "jptung",
            eod
        }
    })
}

export function getStockCodes () {
    return instance.get('/apivn.php', {
        params: {
            client: "jptung",
            symbol: "all"
        }
    })
}

export function getTicker(ticker) {
    return instance.get('/apivn.php', {
        params: {
            client: "jptung",
            ticker
        }
    })
}

export function getPhaiSinh() {
    return instance.get('/apivn.php', {
        params: {
            client: "jptung",
            quote: "ps"
        }
    })
}