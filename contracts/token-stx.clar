(use-trait src20-token-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token.src20-token)
(impl-trait 'ST36RB75734NSAPMF8FSZQ0DEWPCPS68PWFK22QN7.src20-token.src20-token)
;;wrapr 

(define-data-var total-supply uint u0)

(define-fungible-token wrapped-token)

;; Total number of tokens in existence.
(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

;; get the token balance of owner
(define-read-only (get-balance-of (owner principal))
  (begin
    (ok (ft-get-balance wrapped-token owner))
  )
)

(define-read-only (get-name)
  (ok "stx-wrapr")
)
;; the number of decimals used
(define-read-only (decimals)
  (ok u8)
)

;; Transfers tokens to a specified principal (<trait>)
(define-public (transfer (recipient principal) (amount uint))
  (begin
    (ft-transfer? wrapped-token amount tx-sender recipient)
  )
)
;;transfer tokens from a sender to a recepient (<trait>)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  (ft-transfer? wrapped-token amount sender recipient)
)

;; transfer amount STX and return wrapped fungible token
;; mints new token
(define-public (wrap (amount uint))
  (let ((contract-address (as-contract tx-sender)))
    (if
      (and
        (is-ok (stx-transfer? amount tx-sender contract-address))
        (is-ok (ft-mint? wrapped-token amount tx-sender))
      )
      (begin
        (var-set total-supply (+ (var-get total-supply) amount))
        (print amount)
        (print (var-get total-supply))
        (ok (list amount (var-get total-supply)))
      )
      (begin
        (err false)
      )
    )
  )
)

;; unwraps wrapped STX token
;; burns unwrapped token (well, can't burn yet, so will forever increase, good thing there is no limit)
(define-public (unwrap (amount uint))
  (let ((caller tx-sender) (contract-address (as-contract tx-sender)))
    (if
      (and
        (<= amount (var-get total-supply))
        ;; this is where burn would be more appropriate, as trying to reuse tokens or mint
        ;; would make the code more complex for little benefit
        (is-ok (ft-transfer? wrapped-token amount caller contract-address))
        (is-ok (as-contract (stx-transfer? amount contract-address caller)))
      )
      (begin
        (var-set total-supply (- (var-get total-supply) amount))
        (ok (list amount (var-get total-supply)))
      )
      (err false)
    )
  )
)



