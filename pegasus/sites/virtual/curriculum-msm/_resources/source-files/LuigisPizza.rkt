;; The first three lines of this file were inserted by DrRacket. They record metadata
;; about the language level of this file in a form that our tools can easily process.
#reader(lib "htdp-beginner-reader.ss" "lang")((modname LuigisPizza) (read-case-sensitive #t) (teachpacks ()) (htdp-settings #(#t constructor repeating-decimal #f #t none #f ())))
; cost : String -> Number
; given a Topping, produce the cost of a pizza with that topping
(define (cost topping)
  (cond
    [(string=? topping "cheese")     9.00]
    [(string=? topping "pepperoni") 10.50]
    [(string=? topping "chicken")   11.25]
    [(string=? topping "broccoli")  10.25]
    [else "That's not on the menu!"]))

;; Click "Run" and try using cost in the interactions window!
;; for example, (cost "cheese") should evaluate to 9.