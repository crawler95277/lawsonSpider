var ajax = require("./utils/ajax");
var util = require("./utils/util");

const mainApiSignatureKey = "srs_signature_xxxx"; //需自己去找,仅供学习参考
const modulesApiSignatureKey = "yO7rE1nxxx"; //需自己去找,仅供学习参考

var shopList = [];

function i() {
  var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var e = "", r = 0; r < 6; r++) {
    var t = Math.floor(Math.random() * c.length);
    e += c[t];
  }
  return e;
}

/**
 * 加密方法
 */
function getSinger(type) {
  let key = "";

  if (type == 1) {
    key = mainApiSignatureKey;
  } else if (type == 2) {
    key = modulesApiSignatureKey;
  } else {
    throw "type is null";
  }
  let randomStr = i();
  let time = new Date().getTime();

  var jsSHA = require("jssha");
  var n = new jsSHA("SHA-1", "TEXT");
  n.update("".concat(key).concat(randomStr).concat(time));
  return {
    nonce: randomStr,
    timestamp: time,
    signature: n.getHash("HEX"),
  };
}

async function start() {
  //城市列表
  //https://lawsonapi.yorentown.com/area/cs-lawson/app/v1/mina/cityList
  let param = getSinger(1);
  let data = await ajax.ajax(
    "https://lawsonapi.yorentown.com/area/cs-lawson/app/v1/mina/cityList",
    "GET",
    param
  );
  for (let i = 0; i < data.data.length; i++) {
    let item = data.data[i];
    console.log("获取" + item.cityName + "的数据中...");
    //获取店铺列表
    await getShopList(item);
    console.log("等待中");
    //随机1-3秒休眠
    await util.sleep(Math.floor(Math.random() * 3000) + 1000);
  }
  saveFile();
}

async function getShopList(item) {
  //店铺列表
  //https://lawsonapp.yorentown.com/modules/v1/waimai/shops
  let param = getSinger(2);
  param.cityCode = item.cityCode;
  let data = await ajax.ajax(
    "https://lawsonapp.yorentown.com/modules/v1/waimai/shops",
    "GET",
    param
  );
  let shopData = { ...item };
  shopData.list = data.data.shops;
  shopList.push(shopData);
}

function saveFile() {
  util.saveFile("shopList.json", shopList).then((res) => {
    console.log("数据获取成功");
  });
}

start();
