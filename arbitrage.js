//theory->https://www.investopedia.com/terms/t/triangulararbitrage.asp#toc-what-is-triangular-arbitrage

const axios = require("axios");
const Ws = require("ws");
const Sort=require('timsort')
const fs=require('fs')
const arbPairs=require('./path')
// const eventEmitter=new (require('events'))()

const binance_3pair_Arbitrage = {
  pairs: {
    //ticker1:1,ticker2:1....
  },
  assets: [],
  arbitragePairs: [],
  getTradingPairs: async function () {
    try {
      const config = {
        url: "https://api.binance.com/api/v3/exchangeInfo",
        method: "GET",
      };
      const res = await axios(config);
      if (res.status == 200 && res.data && res.data.symbols) {
        let assets = {};
        res.data.symbols.forEach((ticker) => {
          if (ticker.status == "TRADING") {
            this.pairs[ticker.symbol] = -1;
            assets[ticker.baseAsset] = 1;
            assets[ticker.quoteAsset] = 1;
          }
        });
        this.assets = Object.keys(assets);
        console.log('pairs,assets fetched')
        return 1
      }
    } catch (e) {
      console.log("error@getTradingPairs:", e);
      return 0;
    }
  },
  pricews: async function () {
    const ws = new Ws("wss://stream.binance.com:9443/ws/!miniTicker@arr");
    ws.on("close", async () => {
      await this.sleep(1000 * 10);
      return this.pricews();
    });
    ws.on("error", (err, reason) => {
      console.log(`pricews error ${err},reason ${reason}`);
    });
    ws.on("ping", () => {
      ws.pong();
    });
    ws.on("open", () => {
      console.log("pricews open");
    });
    ws.on("message", async (data) => {
      data = JSON.parse(data);
      // console.log(data)
      await this.calculatePercentage(data);
    });
  },
  sleep: async function (ms) {
    return new Promise((resolve) => {
      console.log(`waiting ${ms} millisecond`);
      setTimeout(resolve, ms);
    });
  },
  getArbitrageRoutes: async function () {
    console.log('arbitrage routes calculation start')
    let a1 = this.assets;
    let a2 = this.assets;
    let a3 = this.assets;
    let noOfAssets=a1.length
    console.log(noOfAssets)
    let count=0
    a1.forEach((asset1) => {
      a2.forEach((asset2) => {
        a3.forEach((asset3) => {
          if (asset1 !== asset2 && asset2 !== asset3 && asset3 !== asset1) {
            let pair1 = null,
              pair2 = null,
              pair3 = null,
              side1 = null,
              side2 = null,
              side3 = null,
              arbitrage = -100,
              path = null;
            if (this.pairs[asset1 + asset2]) {
              side1 = "NUM";
              pair1 = asset1 + asset2;              
              path = "sell->";
            } else if (this.pairs[asset2 + asset1]) {
              side1 = "DENOM";
              pair2 = asset2 + asset1;
              path = "buy->";
            }
            if (this.pairs[asset2 + asset3]) {
              side2 = "NUM";
              pair2 = asset2 + asset3;
              path += "sell->";
            } else if (this.pairs[asset2 + asset3]) {
              side2 = "DENOM";
              pair2 = asset3 + asset2;
              path += "buy->";
            }
            if (this.pairs[asset3 + asset1]) {
              side3 = "NUM";
              pair2 = asset3 + asset1;
              path += "sell->";
            } else if (this.pairs[asset1 + asset3]) {
              side3 = "DENOM";
              pair3 = asset1 + asset3;
              path += "buy->";
            }
            if (pair1 && pair2 && pair3) {
              let data = {
                pair1: pair1,
                pair2: pair2,
                pair3: pair3,
                side1: side1,
                side2: side2,
                side3: side3,
                arbitrage: -100, //this is percentage value
                tradingPath: path,
                coinPath: asset1+"->" + asset2+"->" + asset3+"->",
              };
              this.arbitragePairs.push(data);
            }
          }
        });
      });
      // console.log('--',this.arbitragePairs)
      console.log(count++)
    });
    console.log('total Paths->',this.arbitragePairs.length)
    console.log('arbitrage routes calculation complete')
    const writer=fs.createWriteStream('./path.js',{
      highWaterMark:1024*1024
    })
    writer.write('let arbPairs='+JSON.stringify(this.arbitragePairs)+';module.exports=arbPairs')

    
  },
  calculatePercentage: async function (data) {
    try {
//change-x-to-coin-y->if in pair coin y is num->buy else-> sell
//going from xtoy with y in denom->s in num->b
//having x coin ,let pair (xy,yz,zx),(xy,yz,xz),(xy,zy,zx),(xy,zy,xz)->4+4 possibility->xy+yx

//(xy,yz,zx),(xy,yz,xz),(xy,zy,zx),(xy,zy,xz)->sss,ssb,sbs,sbb
//(yx,yz,zx),(yx,yz,xz),(yx,zy,zx),(yx,zy,xz)->bss,bsb,bbs,bbb

//sell->*,buy->/ ex-xy-100 have 1x s1x 100y have 1y s1y 1x/100

//xy yz zx 1.1,1.2,0.5 1x  p=1.1*1.2*0.5-1 p%=p*100
//xy zy zx 1.1,1.2,0.5 1x  p=1.1/1.2*0.5-1 p%=p*100

      if (data == null || data.length == 0) {
        return;
      }
      data.forEach((ticker)=>{
        this.pairs[ticker.s]=ticker.c
      })
      this.arbitragePairs.forEach((_3pairs)=>{
        if(this.pairs[_3pairs.pair1]!==-1 && this.pairs[_3pairs.pair2]!==-1 && this.pairs[_3pairs.pair3]!==-1){

            if(_3pairs.side1=='NUM'){
                _3pairs.arbitrage=this.pairs[_3pairs.pair1]
            }
            else{
                _3pairs.arbitrage=1/this.pairs[_3pairs.pair1]
            }
            if(_3pairs.side2=='NUM'){
                _3pairs.arbitrage*=this.pairs[_3pairs.pair2]
            }
            else{
                _3pairs.arbitrage/=this.pairs[_3pairs.pair2]
            }
            if(_3pairs.side3=='NUM'){
                _3pairs.arbitrage*=this.pairs[_3pairs.pair3]
            }
            else{
                _3pairs.arbitrage/=this.pairs[_3pairs.pair3]
            }
            console.log(_3pairs.arbitrage)
            _3pairs.arbitrage=(_3pairs.arbitrage-1)*100
            // console.log(_3pairs.pair1,this.pairs[_3pairs.pair1],_3pairs.pair2,this.pairs[_3pairs.pair2],_3pairs.pair3,this.pairs[_3pairs.pair3])

        }
      })

      // eventEmitter.emit('arbitrageUpdate')
      Sort.sort(this.arbitragePairs,this.sortPercentageWise)``
      console.log('------------------------')
      // console.log(this.arbitragePairs[0])
      // console.log(this.arbitragePairs[1])
      // console.log(this.arbitragePairs[2])
      console.log(this.arbitragePairs)
      console.log('------------------------')
      return
    } catch (e) {
      console.log("error@calculatePercentage",e);
      return
    }
  },
  sortPercentageWise:async function(a,b){
    return (a.arbitrage-b.arbitrage)
  }
};

binance_3pair_Arbitrage.getTradingPairs((res)=>{}).then(async()=>{
// console.log(binance_3pair_Arbitrage.pairs)
// console.log(binance_3pair_Arbitrage.assets)
// await binance_3pair_Arbitrage.getArbitrageRoutes()
binance_3pair_Arbitrage.arbitragePairs=arbPairs
binance_3pair_Arbitrage.pricews()
})