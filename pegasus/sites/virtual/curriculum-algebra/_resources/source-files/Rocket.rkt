;; The first three lines of this file were inserted by DrRacket. They record metadata
;; about the language level of this file in a form that our tools can easily process.
#reader(lib "htdp-beginner-reader.ss" "lang")((modname Rocket) (read-case-sensitive #t) (teachpacks ()) (htdp-settings #(#t constructor repeating-decimal #f #t none #f ())))
(require "Teachpacks/function-teachpack.ss")

; rocket-height : Number -> Number
; Purpose: how high is the rocket after the given number of seconds?
(EXAMPLE (rocket-height 0) 0)

(define (rocket-height seconds) 0)


;;;; this line will make the rocket fly automatically when "Run" is clicked
;;;; hit the Space Bar to make each second tick by
(start rocket-height)