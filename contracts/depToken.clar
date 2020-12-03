(define-non-fungible-token dTokens (tuple (investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint)))

;; Mint deposit tokens
(define-public (mint-d-tokens (recipient principal) (investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint))
    (begin
        (nft-mint? dTokens (tuple (investor investor) (token-x token-x) (token-y token-y) (token-x-amount token-x-amount) (token-y-amount token-y-amount)) recipient)
        (ok true)
    ) 
)

;;must have some way of destroying dTokens


;;transfer dToken 
(define-public (transfer (account principal) (recipient principal) (investor principal) (token-x principal) (token-y principal) (token-x-amount uint) (token-y-amount uint))
  (nft-transfer? dTokens (tuple (investor investor) (token-x token-x) (token-y token-y) (token-x-amount token-x-amount) (token-y-amount token-y-amount)) account recipient)
)
