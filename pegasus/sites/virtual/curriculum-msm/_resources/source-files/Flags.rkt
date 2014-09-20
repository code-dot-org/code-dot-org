;; The first three lines of this file were inserted by DrRacket. They record metadata
;; about the language level of this file in a form that our tools can easily process.
#reader(lib "htdp-beginner-reader.ss" "lang")((modname Flags) (read-case-sensitive #t) (teachpacks ()) (htdp-settings #(#t constructor repeating-decimal #f #t none #f ())))
(require "Teachpacks/bootstrap-teachpack.rkt")

; 1) start with a red dot, of radius 50
(define dot (circle 50 "solid" "red"))


; 2) define a variable called "blank", which is a 300x200, outlined black rectangle
(define blank (rectangle 300 200 "outline" "black"))


; 3) define "japan" to be the flag of japan (a red dot, centered on a blank rectangle)
(define japan (put-image dot
                         150 100
                         blank))


; what else can you make...?