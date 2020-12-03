;;commenting out as giving parse errors
;;(impl-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token.src20-token)
;;any src20 compatible currency tokens wrapped BTC

(define-fungible-token fungible-token)

;; Storagae
(define-data-var total-supply uint u0)

;; token name (<trait>)
(define-read-only (get-name)
  (ok "{{token-x}}")
)

;; Total number of tokens in existence (<trait>)
(define-private (get-total-supply)
  (var-get total-supply))

;; Transfers tokens to a specified principal (<trait>)
(define-public (transfer (recipient principal) (amount uint))
  (ft-transfer? fungible-token amount tx-sender recipient)
)

;;transfer tokens from a sender to a recepient (<trait>)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  (ft-transfer? fungible-token amount sender recipient)
)

;; get token balance of a recepient (<trait>)
(define-read-only (get-balance-of (owner principal))
  (begin
    (ok (ft-get-balance fungible-token owner))
  )
)

;; Mint new tokens 
(define-private (mint! (account principal) (amount uint))
  (if (<= amount u0)
      (err false)
      (begin
        (var-set total-supply (+ (var-get total-supply) amount))
        (ft-mint? fungible-token amount account)
        (ok amount)
      )
  )
)
