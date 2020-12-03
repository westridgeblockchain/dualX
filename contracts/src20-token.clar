;; The function needed by tokens compatible with SRC20 
;; a subset of ERC20 methods
(define-trait src20-token
  (
    ;; Transfer from the caller to a new principal
    (transfer (principal uint) (response bool uint))
    
    ;; Transfer from the sender to a new principal
    (transfer-from (principal principal uint) (response bool uint))

    ;; the human readable name of the token
    (get-name () (response (buff 32) uint))

    ;; the balance of the passed principal
    (get-balance-of (principal) (response uint uint))

    ;; the current total supply (which does not need to be a constant)
    (get-total-supply () (response uint uint))
  )
)


