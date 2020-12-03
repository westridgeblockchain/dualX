# dualX
DualX is a collection of Clarity smart contracts for Stacks 2.0	 blockchain that will implement a De-Fi ecosystem of exchanges (DepX and GamX). 

It provides the opportunity for an investor (say denominated in BTC) to earn a yield on their funds while passively waiting to buy an investment asset (say STX) with those funds. This results in a deposit at the Deposit Exchange (DepX). The counterparty who takes this deposit in return for providing the yield receives a Deposit Token (dToken) certifying their ownership of the deposit. Also agreed between the Investor and the Yield Provider are the maturity of the deposit and a conversion rate between BTC and STX. This gives the Yield Provider an option to decide at maturity whether to return the original BTC amount or an equivalent STX amount converted at the conversion rate. They would choose whichever is more profitable for them.

In second phase of the implementation (to be completed later) the Yield Provider would then take their dToken to a DEX called Gamma Exchange (GamX). This would provide two-way liquidity in the BTC/STX pair on the back of the optionality that the dToken owner have from the choice of currency they want to return the investment in. This would result in a pool of liquidity like Uniswap with the dToken owners as the liquidity providers. However, given the trading is happening on the back of the deposit exposure they have, there would not be any “impermanent” loss to them. At the time of maturity, the dToken owners should have the funds available to them (BTC or STX) in the more favorable currency for them to return to the Investor.

## At inception of the contract
Yield provider provides the yield Y [BTC] Investor provides funds (B-Y) [BTC]. Effectively Investor has received the yield upfront. They both agree a maturity time T and conversion rate K such that K = B/X where X is equivalent amount of funds in STX. The Yield Provider receives X number of dTokens.

## At maturity of deposit
The Yield Provider decides on a number P such that 0<=P<=1, and returns his dTokens along with any STX funds, to the contract. The Investor is given back:

P*X  [STX] + (1-P)*X*K [BTC]

## Benefits
The investor (who is a passive buyer of STX using his BTC) earns a yield in BTC and has the chance of buying STX or getting his BTC back. 

In second phase of the implementation where dTokens will be entered into GamX we will be able to create a native pool of liquidity of any asset (e.g. STX/BTC in our exampe) which could be a great tool used by new projects to generate liquidity without having to incur costs either through market maker retainers on CEXs or through “impermanent” losses on DEXs. 

# Deposit Exchange API
A list of main functions implementing deposit exchange functionality:

## add-option
Provider and investor agree and provider creates an option with terms of contract including currency pair and relative amount of both representing strike K, yield and investment period in days
```
(add-option (investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint) (yield-amount uint) (yield-period uint))
```

## confirm-agreement
Investor will confirm to the terms of an added option. If the provided terms of option match with those added by the proivder in the system then the dualX does the following two transfers:

1. transfers deposit currency (referred to as token-x e.g., wrapped BTC) - yield from investor. This ensures the investor has an upfront yield on his investment
2. transfers yield amount in deposit currency from provider

If both the transfers were successfull, the contract confirms the investment and its expiry time is set from the current block height. Additionally, the provider is issued dTokens representing an option that will be worked with in extension work and has worth which can be sold to someone.
```
(confirm-agreement (provider principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint) (yield-amount uint) (yield-period uint))
```
### possible errors:


## exercise-option
Provider can exercise the option he holds at any time until the expiry. At the exercise time, the provider will provide a number P such that 0<=P<=1. The function will check if the provider and investor have a valid contract and that investment period has not yet elapsed. If so the following transfers will be made on the basis of P:

1. transfer (token-y-amount * P) token-y to investors (part paid in STX)
2. transfer ((1-P)* token-y-amount * K) token-x to investor (part paid from the original deposit in BTC)
3. transfer ((P)*token-y-amount*K) token-x to provider (part paid from the original deposit in BTC)

```
(exercise-option (investor principal) (P uint) (exp int))
```
The contract is then updated to remove the exercised option from record.

### possible errors:

## get-return
Any time after the investment period has elapsed, the investor can ask for his initial investment to the returned if the provider has not exercised the option and already triggered the transfers. Full amount of the initial investment in deposit currency is made as per the contract terms. The yield was already with the investor when he deposited the investment and confirmed the contract.

```
(get-return (provider principal))
```
### possible errors:
- no-investment-err 
means the provider has exercised the option and sent yield and dual currency amount already there is no further investment returns
- too-soon-err
Investment period has not yet elapsed
