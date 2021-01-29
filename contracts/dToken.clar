(use-trait dToken-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.dToken-trait.dToken-trait)
(impl-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.dToken-trait.dToken-trait)


(define-fungible-token deposit-token)

;; Storagae
(define-map owners {holder: principal}
                    {pair: (string-ascii 65), strike: uint, expiry: uint, amount: uint}
)
(define-constant no-token-err u100)
(define-constant token-expired-err u101)

;; token name (<trait>)
(define-read-only (get-name)
  (ok "deposit-token")
)
;; the number of decimals used
(define-read-only (decimals)
  (ok u0)
)

;; get token balance of a recepient (<trait>)
(define-read-only (get-balance-of (owner principal))
  (begin
    (ok (ft-get-balance deposit-token owner))
  )
)

;; Transfers tokens to a specified principal (<trait>)
(define-public (transfer (recipient principal) (amount uint))
  (begin  
    (print "dToken.transfer")
    (print amount)
    (print tx-sender)
    (print recipient)
    (ft-transfer? deposit-token amount tx-sender recipient)
  )
)

;;transfer tokens from a sender to a recepient (<trait>)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  (let (
          (owner (unwrap! (map-get? owners {holder: sender}) (err no-token-err)))
        )
        (let (
              (expiry-time (get expiry owner))
              )
              (if (< expiry-time block-height)
                (begin
                  (print "dToken.transfer-from")
                  (print amount)
                  (print sender)
                  (print recipient)
                  ;;if contract clone not possible dynamically then we have to check
                  ;; if the recepient has some tokens already from the same series and add up
                  ;; if not then the previous series token will have to be removed first
                  (ft-transfer? deposit-token amount sender recipient)
                  ;;needd to update the owner profile also 
                  ;;map-set ?? WIP
                )
                (err token-expired-err)
              )
        )
        
  )
)


;; Mint deposit tokens
(define-public (issue-d-tokens (account principal) (amount uint) (xToken (string-ascii 32)) (yToken (string-ascii 32)) (strike uint) (expiry uint))
  (if (and
        (> amount u0)
        (is-ok (ft-mint? deposit-token amount account))
      )
      (begin
        (map-insert owners {holder: account}
                          {pair: (concat (concat xToken "/") yToken), strike: strike, expiry: expiry, amount: amount}
        )
        (ok amount)
      )
      (err u0)
  )
)

;;removes deposit tokens from the account
(define-public (burn-d-tokens (account principal) (amount uint))
    (let (
         (contract-address (as-contract tx-sender))
         )
    (if
      (is-ok (ft-transfer? deposit-token amount  account contract-address))
      (begin
        (map-delete owners {holder: account})
        (ok true)
      )
      (err false)
    )
  )
)

(define-public (get-token-pair (account principal))
  (let (
          (owner (unwrap! (map-get? owners {holder: account}) (err no-token-err)))
        )
        (ok (get pair owner))
  )
)

