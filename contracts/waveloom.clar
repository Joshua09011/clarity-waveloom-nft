;; Define NFT token
(define-non-fungible-token waveloom-nft uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-exists (err u102))

;; Data vars
(define-map token-metadata uint 
  {
    title: (string-utf8 256),
    duration: uint,
    creator: principal,
    ipfs-hash: (string-ascii 64),
    royalty-percent: uint
  })

(define-data-var last-token-id uint u0)

;; Mint new audio NFT
(define-public (mint-audio 
  (title (string-utf8 256))
  (duration uint)
  (ipfs-hash (string-ascii 64))
  (royalty-percent uint))
  (let
    ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (nft-mint? waveloom-nft token-id tx-sender))
    (map-set token-metadata token-id
      {
        title: title,
        duration: duration,
        creator: tx-sender,
        ipfs-hash: ipfs-hash,
        royalty-percent: royalty-percent
      })
    (var-set last-token-id token-id)
    (ok token-id)))

;; Transfer NFT
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (nft-transfer? waveloom-nft token-id sender recipient))
    (ok true)))

;; Get audio metadata
(define-read-only (get-audio-metadata (token-id uint))
  (ok (map-get? token-metadata token-id)))

;; Get token owner
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? waveloom-nft token-id)))
