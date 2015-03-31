;; The first three lines of this file were inserted by DrRacket. They record metadata
;; about the language level of this file in a form that our tools can easily process.
#reader(lib "htdp-beginner-reader.ss" "lang")((modname Cage) (read-case-sensitive #t) (teachpacks ()) (htdp-settings #(#t constructor repeating-decimal #f #t none #f ())))
(require "Teachpacks/cage-teachpack.ss")

;;;; YOUR CODE HERE
; Don't forget to include a contract and purpose statement.

; safe-left? : Number -> Boolean
; is any part of the butterfly still visible on the left?
(define (safe-left? x)
  true)


; safe-right? : Number -> Boolean
; is any part of the butterfly still visible on the right?
(define (safe-right? x)
  true)


; onscreen? :  Number -> Boolean
; is any part of the butterfly still on the screen?
(define (onscreen? x)
  (safe-left? x))


;;;; This starts the animation automatically, when "Run" is clicked.
;;;; Use the arrow keys to move the butterfly around the screen!
(start onscreen?)