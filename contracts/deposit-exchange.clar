;; possible errors
(define-constant too-soon-err u10)
(define-constant period-elapsed-err u11)
(define-constant no-option-err u12)
(define-constant no-investment-err u13)
(define-constant transfer-failed-err u14)

;;private data
;; time is in terms of block height for now
;;expiry-time is the time when this option will expire

(define-map investment-returns
    ((investor principal) (provider principal))
    ((token-x principal) (token-x-amount uint) (token-y principal) (token-y-amount uint) (yield uint) (expiry-time uint)) 
)

;;period is specified as number of days
(define-map options 
    ((investor principal) (provider principal) (token-x principal) (token-y principal))
    ((token-x-amount uint) (token-y-amount uint) (yield uint) (period uint)) 
)    

;;public funtions
;;an agreement between the two parties on currency pair dualX and respective amount terms representing strike K
(define-public (add-option (investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint) (yield-amount uint) (yield-period uint))
    (begin 
        (map-insert options ((investor investor) (provider tx-sender) (token-x token-x) (token-y token-y))
                         ((token-x-amount token-x-amount) (token-y-amount token-y-amount) (yield yield-amount) (period yield-period))
        )
        (ok true)
    )
)


;;Investor will confirm an agreement and create the option for provider
(define-public (confirm-agreement (provider principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint) (yield-amount uint) (yield-period uint))
        (let (
            (option 
                (unwrap! (map-get? options ((investor tx-sender) (provider provider) (token-x token-x) (token-y token-y)))
                 (err no-option-err))
            )
            )
        (if 
            (and 
                (is-eq token-x-amount (get token-x-amount option))
                (is-eq token-y-amount (get token-y-amount option))
                (is-eq yield-amount (get yield option))
                (is-eq yield-period (get period option))
            )
            (let (
                (contract-address (as-contract tx-sender))
                (period-blocks (/ (* yield-period u1440) u10))) ;;assuming 1 block = 10 mins
                (if
                    (and
                        ;;transfer the investment amount - yeild amount from investor - this ensures yield is upfront for the investor
                        ;;transfer the yeild amount from provider
                        (is-ok (print (as-contract (contract-call? 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-x transfer contract-address (- token-x-amount yield-amount)))))
                        (is-ok (print (as-contract (contract-call? 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-x transfer-from provider contract-address yield-amount))))
                    )
                    (begin
                        ;;issue an equal amount of deposit tokens also dTokens
                        (contract-call? dToken mint-d-tokens provider token-y-amount) 
                        (map-insert investment-returns ((investor tx-sender) (provider provider))
                                                        ((token-x token-x) (token-x-amount token-x-amount) (token-y token-x) (token-y-amount token-x-amount) (yield yield-amount) (expiry-time (+ period-blocks block-height)))
                        )
                        (ok true)
                    )
                    (err transfer-failed-err)
                )
            )
            (err no-option-err)
        )
        )
)
;;provider can exercise the option any time prior to the period of maturity
;;a ratio of token-x and token-stx for return to investor
(define-public (exercise-option (investor principal) (P uint) (exp int))
    (begin
        (let (
                ;;confirm that investment is valid
                (investment-return (map-get? investment-returns ((investor investor) (provider tx-sender))))
            )
            ((if 
                (is-some investment-return)
                ((let (
                        (contract-address (as-contract tx-sender))
                        (expiry-time (get expiry-time investment-return))
                        (token-y (get token-y investment-return))
                        (token-y-amount (get token-y-amount investment-return))
                        (token-x (get token-x investment-return))
                        (token-x-amount (get token-x-amount investment-return))
                        (yield (get yield investment-return))
                        (K (/ token-x-amount token-y-amount))
                      )
                     ((if 
                        (>= expiry-time block-height)
                        (
                            ;;need to think about dTokens ... need to revoke those
                           (err period-elapsed-err)
                        ) 
                        (
                            (if (and
                                    ;;investor gets (P*X)[STX] + (1-P)*X*K [BTC]
                                    (is-ok (contract-call? token-y transfer investor (* token-y-amount P))) 
                                    
                                    ;;also the dTokens issued against the original  
                                    (is-ok (contract-call? dToken burn-d-tokens provider token-y-amount))
                                )
                             (
                                ;;investor now gets the portion of BTC (1-P)*X*K [BTC]
                                (contract-call? 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-x transfer-from contract-address investor (* (- 1 P) token-y-amount K))

                                ;;provider can free (P)*X*K [BTC]
                                (contract-call? 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.token-x transfer-from contract-address provider (* P token-y-amount K) )
                                    
                                ;;also remove the entry from returns for the investor
                                (map-delete returns ((investor investor) (provider tx-sender)))
                             ) 
                             (
                                (err transfer-failed-err)
                             )
                             )
                        )
                     ))
                ))
                (err no-investment-err)
            ))
        )
    )
)

;;investor can invoke a get-return function to retrieve 
;;amount in original currency if the provider has not yet returned as per the
;;agreement and the lock period has elapsed
(define-public (get-return (provider principal))
        (let (
                (investment-return (map-get? investment-returns (investor tx-sender) (provider provider)) )
            )
            (if (is-some investment-return)
                (let (
                        (contract-address (as-contract tx-sender))
                        (token-x (get token-x investment-return))
                        (period (get expiry-time investment-return))
                        (amount (get amount investment-return))
                      )
                     ((if 
                        (>= period block-height)
                        (
                            (contract-call? token-x transfer-from contract-address tx-sender amount)
                            (map-delete returns ((investor investor)(provider tx-sender)))
                        ) 
                        (err too-soon-err)
                     ))
                )
                ;;means the provider has exercised the option and sent yield and dual currency amount already
                ;;there is no further investment returns
                (err no-investment-err)
            )
        )	
)
