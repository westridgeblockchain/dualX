;; The function needed by tokens compatible with SRC20 
;; a subset of ERC20 methods with additional methods for issuing and burning dTokens
(define-trait dToken-trait
  (
    ;; Transfer from the caller to a new principal
    (transfer (principal uint) (response bool uint))
    
    ;; Transfer from the sender to a new principal
    (transfer-from (principal principal uint) (response bool uint))

    ;; the number of decimals used, e.g. 6 would mean 1_000_000 represents 1 token
    (decimals () (response uint uint))

    ;; the human readable name of the token
    (get-name () (response (string-ascii 32) uint))

    ;; the balance of the passed principal
    (get-balance-of (principal) (response uint uint))

    ;;issue dTokens
    (issue-d-tokens (principal uint (string-ascii 32) (string-ascii 32) uint) (response uint uint))

    (burn-d-tokens (principal uint) (response bool bool))
  )
)


