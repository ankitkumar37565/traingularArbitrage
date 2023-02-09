# Traingular Arbitrage

Finding traingular arbitrage among all trading pairs for Binance Exchange

## Theory

[Wikipedia](https://en.wikipedia.org/wiki/Triangular_arbitrage)

[Investopedia](https://www.investopedia.com/terms/t/triangulararbitrage.asp#toc-what-is-triangular-arbitrage)



## For use

~~~
1.clone the repository

2.run pip install 

3.run node arbitrage.js
~~~

## Features

#### Every second it will print the top 3 arbitrage value after arbitrage calculation.The arbitrage array contains the format as shown below

~~~
[{
  pair1: 'QIBTC',
  pair2: 'BTCBUSD',
  pair3: 'QIBUSD',
  side1: 'NUM',
  side2: 'NUM',
  side3: 'DENOM',
  arbitrage: 0.48349687778770356,
  tradingPath: 'sell->sell->buy->',
  coinPath: 'QI->BTC->BUSD->',
  arbitrageWithFee: 0.18349687778770357
}
{
  pair1: 'GASBTC',
  pair2: 'BTCBUSD',
  pair3: 'GASBUSD',
  side1: 'NUM',
  side2: 'NUM',
  side3: 'DENOM',
  arbitrage: 0.3779954120346041,
  tradingPath: 'sell->sell->buy->',
  coinPath: 'GAS->BTC->BUSD->',
  arbitrageWithFee: 0.07799541203460408
}
{
  pair1: 'ZECBTC',
  pair2: 'BTCUSDT',
  pair3: 'ZECUSDT',
  side1: 'NUM',
  side2: 'NUM',
  side3: 'DENOM',
  arbitrage: 0.32629653333333675,
  tradingPath: 'sell->sell->buy->',
  coinPath: 'ZEC->BTC->USDT->',
  arbitrageWithFee: 0.026296533333336758
}....]
~~~