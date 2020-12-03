(define-fungible-token deposit-token)

;; Storagae
(define-data-var total-supply uint u0)
(define-map avilable-option ((holder principal)) 
                     ((investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint))
)


;; token name (<trait>)
(define-read-only (get-name)
  (ok "token-d")
)

;; Total number of tokens in existence (<trait>)
(define-private (get-total-supply)
  (var-get total-supply))

;; Transfers tokens to a specified principal (<trait>)
(define-public (transfer (recipient principal) (amount uint))
  (ft-transfer? deposit-token amount tx-sender recipient)
)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  (ft-transfer? deposit-token amount sender recipient)
)

;; get token balance of a recepient (<trait>)
(define-read-only (get-balance-of (owner principal))
  (begin
    (ok (ft-get-balance deposit-token owner))
  )
)


;; Mint deposit tokens
(define-public (mint-d-tokens (account principal) (amount uint) (investor principal) ())
  (if (<= amount u0)
      (err false)
      (begin
        (var-set total-supply (+ (var-get total-supply) amount))
        (ft-mint? deposit-token amount account)
        (ok amount)
      )
  )
)

;;removes deposit tokens from the account
(define-public (burn-d-tokens (account principal)(amount uint))
    (let (
         (contract-address (as-contract tx-sender))
         )
    (if
      (is-ok (ft-transfer? deposit-token amount  account contract-address))
      (begin
        (var-set total-supply (- (var-get total-supply) amount))
        (ok true)
      )
      (err false)
    )
  )
)



