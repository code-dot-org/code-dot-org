;; The first three lines of this file were inserted by DrRacket. They record metadata
;; about the language level of this file in a form that our tools can easily process.
#reader(lib "htdp-beginner-reader.ss" "lang")((modname Bugs) (read-case-sensitive #t) (teachpacks ()) (htdp-settings #(#t constructor repeating-decimal #f #t none #f ())))
;;;;;;;;;;;;;;;;;; Bug #1 ;;;;;;;;;;;;;;;;;;;;;;
(*3 2)


;;;;;;;;;;;;;;;;;; Bug #2 ;;;;;;;;;;;;;;;;;;;;;;
(+  1 (2))


;;;;;;;;;;;;;;;;;; Bug #3 ;;;;;;;;;;;;;;;;;;;;;;
(+ 5 (* 1))


;;;;;;;;;;;;;;;;;; Bug #4 ;;;;;;;;;;;;;;;;;;;;;;
(define h(x) 
  (+ x 10))

;;;;;;;;;;;;;;;;;; Bug #5 ;;;;;;;;;;;;;;;;;;;;;;
(define (g x)
  + x 10)

;;;;;;;;;;;;;;;;;; Bug #6 ;;;;;;;;;;;;;;;;;;;;;;
(define (f 1)
  (+ x 10))

;;;;;;;;;;;;;;;;;; Bug #7 ;;;;;;;;;;;;;;;;;;;;;;
(string-length 20)

;;;;;;;;;;;;;;;;;; Bug #8 ;;;;;;;;;;;;;;;;;;;;;;
(define (times n n) 
  (* n n))​