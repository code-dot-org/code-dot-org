#lang scheme/gui

(require lang/prim
         lang/posn
         "bootstrap-common.rkt"
         (except-in htdp/testing test)
         (for-syntax scheme/base))
(provide (all-from-out "bootstrap-common.rkt"))
(provide-higher-order-primitive start (onscreen?))

(define WIDTH  640)
(define HEIGHT 480)

(define butterfly (bitmap "teachpack-images/butterfly.png"))

; a make-world is a (Number Number)
; each world has an x and y coordinate
(define-struct world [x y])

;; move: World Number -> Number 
;; did the object move? 
(define (move w key)
  (cond
    [(not (string? key)) w]
    [(string=? key "left") 
     (make-world (- (world-x w) 10) (world-y w))]
    [(string=? key "right") 
     (make-world (+ (world-x w) 10) (world-y w))]
    [(string=? key "down") 
     (make-world (world-x w) (- (world-y w) 10))]
    [(string=? key "up") 
     (make-world (world-x w) (+ (world-y w) 10))]
    [else w]))


;; ----------------------------------------------------------------------------
;; draw-world: World -> Image 
;; create an image that represents the world 
(define (draw-world w)
  (let* ((draw-butterfly 
          (lambda (w scene)
            (place-image butterfly 
                         (world-x w) 
                         (- HEIGHT (world-y w))
                         scene)))
         (draw-text 
          (lambda (w scene)
            (overlay/align "middle" "top" 
             (text 
              (string-append "x-coordinate: " 
                             (number->string (world-x w))
                             "   y-coordinate: "
                             (number->string (world-y w)))
              14 'black)
             scene))))
    (draw-butterfly w 
                    (draw-text w (empty-scene WIDTH HEIGHT)))))


(define (start onscreen?)
  (let* ((onscreen?* (if (= (procedure-arity onscreen?) 2) 
                        onscreen?
                        (lambda (x y) (onscreen? x))))
         (update (lambda (w k) 
                   (if (onscreen?* (world-x (move w k)) 
                                  (world-y (move w k))) 
                       (move w k)
                       w))))
    (big-bang (make-world (/ WIDTH 2) (/ HEIGHT 2))
              (on-draw draw-world)
              (on-key update))))
