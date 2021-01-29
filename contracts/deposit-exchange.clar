(use-trait src20-token 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token.src20-token)
(use-trait dToken-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.dToken-trait.dToken-trait)

;; possible error codes
(define-constant too-soon-err u10)
(define-constant period-elapsed-err u11)
(define-constant no-option-err u12)
(define-constant no-investment-err u13)
(define-constant transfer-failed-err u14)
(define-constant not-enough-funds-err u15)

;;contract owner for admin functions
(define-constant contract-owner 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7)

;;private data
;; time is in terms of block height for now
;;expiry-time is the time when this option will expire

(define-map options
    {investor: principal, provider: principal}
    {token-x: principal, token-x-amount: uint, token-y: principal, token-y-amount: uint, yield: uint, expiry-time: uint}
)

(define-map locked-deals
    {investor: principal, provider: principal, isHedger: bool}
    {token-x: principal, token-x-amount: uint, token-y: principal, yield: uint, expiry-time: uint}
)

;;period is specified as number of days
;;(define-map options 
;;    {investor: principal, provider: principal, token-x: <src20-token>, token-y: principal}
;;    {token-x-amount: uint, token-y-amount: uint, yield: uint, period: uint} 
;;)    

;;public funtions
;;an agreement between the two parties on currency pair dualX and respective amount terms representing strike K
;;(define-public (add-option (investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint) (yield-amount uint) (yield-period uint))
;;    (begin 
;;        (map-insert options {investor: investor, provider: tx-sender, token-x: token-x, token-y: token-y }
;;                           {token-x-amount: token-x-amount, token-y-amount: token-x-amount,yield: yield-amount, period: yield-period}
;;        )
;;        (ok true)
;;    )
;;)

;;Investor will confirm an agreement and create the option for provider
(define-public (invest (provider principal) (token-x <src20-token>) (token-y <src20-token>) (token-x-amount uint) (yield-amount uint) (yield-period uint) (is-hedger bool))
    (begin
    (let (
        (contract-address (as-contract tx-sender))
        (investor tx-sender)
        (period-blocks (/ (* yield-period u1440) u10))
        (transferAmount (- token-x-amount yield-amount))
        ) ;;assuming 1 block = 10 mins
        (if
            (and
                ;;transfer  the investment amount - yeild amount from investor - this ensures yield is upfront for the investor
                ;;transfer the yeild amount from provider
                (is-ok (print (as-contract (contract-call? token-x  transfer-from investor contract-address transferAmount))))
                (is-ok (print (as-contract (contract-call? token-x  transfer-from provider contract-address yield-amount))))
            )
            (begin 
                (map-insert locked-deals {investor: tx-sender, provider: provider, isHedger: is-hedger }
                            {token-x: (contract-of token-x), token-x-amount: token-x-amount, token-y: (contract-of token-y), yield: yield-amount, expiry-time: period-blocks}
                )
                (ok true)
            )
            (err transfer-failed-err)
        )
    )
    )
)

(define-public (begin-cycle (investor principal) (provider principal) (token-x <src20-token>) (token-y <src20-token>) (isHedger bool) (strike uint) (dToken <dToken-trait>))
    (begin
        (let (
                (deal (unwrap! (map-get? locked-deals {investor: investor, provider: provider, isHedger: isHedger }) (err no-investment-err)))
            )
            (let 
                (
                    (contract-address (as-contract tx-sender))
                    (expiry-time (get expiry-time deal))
                    (token-y-trait (get token-y deal))
                    (token-x-trait (get token-x deal))
                    (token-x-amount (get token-x-amount deal))
                    (yield-amount (get yield deal))
                    (token-y-amount (* (/ token-x-amount strike) u100000000))
                )
                (if
                    (is-ok (print (as-contract (contract-call? dToken issue-d-tokens provider token-y-amount "STX" "BTC" strike (+ expiry-time block-height))))) 
                    (begin
                        (if
                            (is-eq isHedger true)
                            (begin
                                (map-insert options {investor: investor, provider: provider }
                                {token-x: token-x-trait, token-x-amount: token-x-amount, token-y: token-y-trait, token-y-amount: token-y-amount, yield: yield-amount, expiry-time: (+ expiry-time block-height)}
                                )
                                (ok token-y-amount)
                            )
                            (if 
                                (and
                                    (is-ok (print (as-contract (contract-call? token-x  transfer-from provider contract-address (/ token-x-amount u2)))))
                                    (is-ok (print (as-contract (contract-call? token-y  transfer-from provider contract-address (/ token-y-amount u2)))))
                                    (is-ok (print (as-contract (contract-call? 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.GamX invest provider)))) 
                                )
                                (begin
                                    (map-insert options {investor: investor, provider: provider }
                                    {token-x: token-x-trait, token-x-amount: token-x-amount, token-y: token-y-trait, token-y-amount: token-y-amount, yield: yield-amount, expiry-time: (+ expiry-time block-height)}
                                    )
                                    (ok token-y-amount)
                                )
                                (err u0)
                            )
                            
                        )
                    )
                    (err u0)
                )
            )
        )
    )
)

;;provider can exercise the option any time prior to the period of maturity
;;a ratio of token-x and token-stx for return to investor
(define-public (exercise-option (investor principal) (token-x <src20-token>) (token-y <src20-token>) (dToken <dToken-trait>) (P uint) )
    (begin
        (let (
                (investment-return (unwrap! (map-get? options {investor: investor, provider: tx-sender}) (err no-investment-err)))
            )
            (let (
                    (contract-address (as-contract tx-sender))
                    (provider tx-sender)
                    (expiry-time (get expiry-time investment-return))
                    (token-y-trait (get token-y investment-return))
                    (token-y-amount (get token-y-amount investment-return))
                    (token-x-trait (get token-x investment-return))
                    (token-x-amount (get token-x-amount investment-return))
                    (yield (get yield investment-return))
                    (K (/ token-y-amount token-x-amount));;strike at begin cycle
                    )
                (if 
                    (< expiry-time block-height);;>= but for testing <
                    (err period-elapsed-err);;need to think about dTokens ... need to revoke those
                    (if 
                        (and
                                ;;investor gets (P*X)[STX] + (1-P)*X*K [BTC]
                                (is-ok (contract-call? token-y transfer investor (* token-y-amount P ))) 
                                ;;investor now gets the portion of BTC (1-P)*X*K [BTC]
                                (is-ok (contract-call? token-x transfer-from contract-address investor  (/ (* (- u100000000 P) token-x-amount) u100000000)))

                                ;;provider can free (P)*X*K [BTC]
                                (is-ok (contract-call? token-x transfer-from contract-address provider (/ (* P token-x-amount) u100000000)))
                
                                ;;also the dTokens issued against the original  
                                (is-ok (contract-call? dToken burn-d-tokens provider token-y-amount))
                        )
                            (ok true) 
                            (err transfer-failed-err)
                            
                    )
                )
            )
        )
    )
)

;;investor can invoke a get-return function to retrieve 
;;amount in original currency if the provider has not yet returned as per the
;;agreement and the lock period has elapsed
(define-public (get-return (provider principal) (token-x <src20-token>) (dToken <dToken-trait>))
    (begin
        (let (
               (investment-return (unwrap! (map-get? options {investor: tx-sender, provider: provider}) (err no-investment-err)))
            )
            (let (
                        (contract-address (as-contract tx-sender))
                        (period (get expiry-time investment-return))
                        (amount (get token-x-amount investment-return))
                        (token-y-amount (get token-y-amount investment-return))
                      )
                     (if 
                        (and 
                            (>= period block-height)
                            (is-ok (contract-call? token-x transfer-from contract-address tx-sender amount))
                            (is-ok (contract-call? dToken burn-d-tokens provider token-y-amount))
                            (map-delete options {investor: tx-sender, provider: provider})
                        )
                        (ok true) 
                        (err too-soon-err)
                     )
                )
        ) 
    )  
)


