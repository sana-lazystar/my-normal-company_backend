/**
 * API 서버
 * 실행 방법: node state.js
 * 개발 환경: nodejs v18.19.0
 *
 * 신발 상품 목록 API (상품 개수 3개 고정)
 * GET http://localhost/?start={index}
 *
 * 셀러별 상품 목록 API (상품 개수 3개 고정)
 * GET http://localhost/sellers/{seller}?start={index}
 *
 * 상품 정보 API
 * GET http://localhost/products/{name}
 *
 * 관심 셀러 등록 API
 * POST http://localhost/sellers/{seller}:favorite
 *
 * 관심 셀러 취소 API
 * DELETE http://localhost/sellers/{seller}:favorite
 */
const http = require("http");
const url = require("url");
const favorite = new Set();
const products = [
  { seller: "신발도매상", name: "레드 런닝화", price: 19000 },
  { seller: "철수네 신발가게", name: "시그니처 런닝 슈즈", price: 29000 },
  { seller: "날아라 운동화", name: "화이트 가성비 깔끔 운동화", price: 45000 },
  { seller: "멋쟁이 신사", name: "Yellow Air Running Shoes", price: 12000 },
  { seller: "신발도매상", name: "빨간 운동화", price: 32000 },
  { seller: "날아라 운동화", name: "화이트 라이징 에어 맥스", price: 18000 },
  { seller: "멋쟁이 신사", name: "노란 공기 운동화", price: 10000 },
  { seller: "철수네 신발가게", name: "Mix Airism", price: 76000 },
  { seller: "날아라 운동화", name: "White Rising Air Max", price: 58000 },
  { seller: "신발도매상", name: "혼합 공기같음", price: 23000 },
  { seller: "멋쟁이 신사", name: "옐로우 에어 런닝화", price: 32000 },
  { seller: "날아라 운동화", name: "하얗게 떠오르는 공기 충만", price: 79000 },
  { seller: "멋쟁이 신사", name: "하얀 가성비 깔끔 운동화", price: 87000 },
  { seller: "철수네 신발가게", name: "특화 달리기 신발", price: 72000 },
  { seller: "신발도매상", name: "Red Running Shoes", price: 57000 },
  { seller: "철수네 신발가게", name: "Signature Running Shoes", price: 39000 },
  { seller: "멋쟁이 신사", name: "믹스 에어리즘", price: 52000 },
  { seller: "신발도매상", name: "White Worthy Clean Sneakers", price: 26000 },
];

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");

    if (req.method === "OPTIONS") {
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url);
    const queries = (parsedUrl.query ?? "")
      .split("&")
      .filter((v) => v)
      .map((v) => v.split("="))
      .reduce((o, v) => ({ ...o, [v[0]]: v[1] }), {});

    if (req.method == "GET" && /^\/health$/.test(parsedUrl.pathname)) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.write(JSON.stringify({ status: "ok" }, null, 2));
      console.log("### Health check");
      return;
    }

    if (req.method == "GET" && parsedUrl.pathname == "/") {
      const start = parseInt(queries.start) || 0;
      const list = products
        .slice(start, start + 3)
        .map((v) => ({ ...v, favorite: favorite.has(v.seller) }));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.write(JSON.stringify(list, null, 2));
      res.end();
      console.log(
        `### Get all products list\n${JSON.stringify(list, null, 2)}`
      );
      return;
    }

    if (
      req.method == "GET" &&
      /^\/sellers\/([^\/]+)\/?$/.test(parsedUrl.pathname)
    ) {
      const seller = decodeURIComponent(parsedUrl.pathname.split("/")[2]);
      const start = parseInt(queries.start) || 0;
      const list = products
        .filter((v) => v.seller === seller)
        .slice(start, start + 3)
        .map((v) => ({ ...v, favorite: favorite.has(v.seller) }));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.write(JSON.stringify(list, null, 2));
      res.end();
      console.log(
        `### Get ${seller}'s products list\n${JSON.stringify(list, null, 2)}`
      );
      return;
    }

    if (
      req.method == "GET" &&
      /^\/products\/([^\/]+)\/?$/.test(parsedUrl.pathname)
    ) {
      const name = decodeURIComponent(parsedUrl.pathname.split("/")[2]);
      console.log(JSON.stringify(products, null, 2));
      const index = products.findIndex((v) => v.name === name);
      const product = {};
      console.log({ name, index, product });
      if (index !== -1) {
        Object.assign(product, products[index], {
          favorite: favorite.has(products[index].seller),
        });
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.write(JSON.stringify(product, null, 2));
      res.end();
      console.log(`### get product ${name}'s information`);
      return;
    }

    if (
      req.method == "POST" &&
      /^\/sellers\/([^\/]+):favorite\/?$/.test(parsedUrl.pathname)
    ) {
      const seller = decodeURIComponent(
        parsedUrl.pathname.split("/")[2].split(":")[0]
      );
      favorite.add(seller);
      res.end();
      console.log(`### add ${seller} to favorite`);
      return;
    }

    if (
      req.method == "DELETE" &&
      /^\/sellers\/([^\/]+):favorite\/?$/.test(parsedUrl.pathname)
    ) {
      const seller = decodeURIComponent(
        parsedUrl.pathname.split("/")[2].split(":")[0]
      );
      favorite.delete(seller);
      res.end();
      console.log(`### delete ${seller} from favorite`);
      return;
    }

    console.log(`### not found ${req.method} ${parsedUrl.pathname}`);
    res.writeHead(404);
    res.end();
  })
  .listen(80);

console.log("server started on 80");
