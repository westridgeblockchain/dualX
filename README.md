# dualX
DualX is a collection of Clarity smart contracts for Stacks 2.0	 blockchain that will implement a De-Fi ecosystem of exchanges (DepX and GamX). 

It provides the opportunity for an investor (say denominated in BTC) to earn a yield on their funds while passively waiting to buy an investment asset (say STX) with those funds. This results in a deposit at the Deposit Exchange (DepX). The counterparty who takes this deposit in return for providing the yield receives a Deposit Token (dToken) certifying their ownership of the deposit. Also agreed between the Investor and the Yield Provider are the maturity of the deposit and a conversion rate between BTC and STX. This gives the Yield Provider an option to decide at maturity whether to return the original BTC amount or an equivalent STX amount converted at the conversion rate. They would choose whichever is more profitable for them.

In second phase of the implementation (to be completed later) the Yield Provider would then take their dToken to a DEX called Gamma Exchange (GamX). This would provide two-way liquidity in the BTC/STX pair on the back of the optionality that the dToken owner have from the choice of currency they want to return the investment in. This would result in a pool of liquidity like Uniswap with the dToken owners as the liquidity providers. However, given the trading is happening on the back of the deposit exposure they have, there would not be any “impermanent” loss to them. At the time of maturity, the dToken owners should have the funds available to them (BTC or STX) in the more favorable currency for them to return to the Investor.

# At inception of the contract
Yield provider provides the yield Y [BTC] Investor provides funds (B-Y) [BTC]. Effectively Investor has received the yield upfront. They both agree a maturity time T and conversion rate K such that K = B/X where X is equivalent amount of funds in STX. The Yield Provider receives X number of dTokens.

# At maturity of deposit
The Yield Provider decides on a number P such that 0<=P<=1, and returns his dTokens along with any STX funds, to the contract. The Investor is given back:

P*X  [STX] + (1-P)*X*K [BTC]

# Benefits
The investor (who is a passive buyer of STX using his BTC) earns a yield in BTC and has the chance of buying STX or getting his BTC back. 

In second phase of the implementation where dTokens will be entered into GamX we will be able to create a native pool of liquidity of any asset (e.g. STX/BTC in our exampe) which could be a great tool used by new projects to generate liquidity without having to incur costs either through market maker retainers on CEXs or through “impermanent” losses on DEXs. 
