(use-trait src20-token-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token.src20-token)
(impl-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token.src20-token)
;;any src20 compatible currency tokens such as wrapped BTC

(define-fungible-token fungible-token)

;; Storagae
(define-data-var total-supply uint u0)

;; token name (<trait>)
(define-read-only (get-name)
  (ok "wrapped-btc")
)

;; the number of decimals used
(define-read-only (decimals)
  (ok u8)
)
;; get token balance of a recepient (<trait>)
(define-read-only (get-balance-of (owner principal))
  (begin
    (ok (ft-get-balance fungible-token owner))
  )
)

;; Transfers tokens to a specified principal (<trait>)
(define-public (transfer (recipient principal) (amount uint))
  (begin  
    (print "x.transfer")
    (print amount)
    (print tx-sender)
    (print recipient)
    (ft-transfer? fungible-token amount tx-sender recipient)
  )
)

;;transfer tokens from a sender to a recepient (<trait>)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
(begin
  (print "x.transfer-from")
  (print amount)
  (print sender)
  (print recipient)
  (ft-transfer? fungible-token amount sender recipient)
  )
)



;; Mint new tokens 
(define-private (mint! (account principal) (amount uint))
  (if (< amount u0)
      (err u0)
      (if 
            (and 
                (is-eq (var-set total-supply (+ (var-get total-supply) amount)) true)
                (is-ok (ft-mint? fungible-token amount account))
            )
            (ok amount)
            (err u0)
      ) 
  )
)

;; Initialize the contract

(mint! 'ST2FWP4ZSFJ0GPD5ADR32M1AXC7ASE1GXB2R0NDTJ u2000000000)  ;; investor 
(mint! 'ST1F6TC9D7TQ0EV6VJ1WNJ53R26Q2ASRGWYVSSX23 u200000000)  ;; provider 
