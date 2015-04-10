#lang scheme/gui

(require 2htdp/universe
         lang/prim
         lang/posn
         "bootstrap-common.rkt"
         (for-syntax scheme/base))

(provide play make-game *score* *player-x* *player-y*
         (all-from-out "bootstrap-common.rkt")
         (except-out (all-from-out 2htdp/universe) on-key on-mouse))


; pass all student-defined functions to animate/proc, exposed as start
(define-higher-order-primitive make-game make-game/proc
  (title title-color
         background 
         dangerImgs update-danger
         targetImgs update-target
         playerImg  update-player
         projectileImg update-projectile
         distances-color line-length distance
         collide? onscreen?))

;; SETTINGS 
(define WIDTH 640)
(define HEIGHT 480)
(define EXPLOSION-COLOR "gray")
(define TITLE-COLOR (box "white"))
(define BACKGROUND (box(rectangle WIDTH HEIGHT "solid" "black")))
(define (spacing) (random 200))
(define *target-increment* 20)
(define *danger-increment* -50)
(define LOSS-SCORE 0)

;; Globals available to the students:
(define *score* (box 0))
(define *player-x* (box 0))
(define *player-y* (box 0))

;; Student debugging:
(define *line-length* (box (lambda(a b) 0)))
(define *distance* (box (lambda(px cx py cy) 0)))
(define *distances-color* (box ""))

;fit-image-to: number number image -> image
;ensures the image is of size first number by second number, may crop the given image
(define (fit-image-to w h an-image)
    (cond
      [(= (image-width an-image) (* (/ w h) (image-height an-image)))
       (scale (/ w (image-width an-image)) an-image)]
      [(> (image-width an-image) (* (/ w h) (image-height an-image))) 
       (scale (/ w (* (/ w h) (image-height an-image)))
              (crop 0 0 (* (/ w h) (image-height an-image)) (image-height an-image) an-image))]
      [(< (image-width an-image) (* (/ w h) (image-height an-image)))
       (scale (/ w (image-width an-image))
              (crop 0 0 (image-width an-image) (* (/ h w) (image-width an-image)) an-image))]
      ))

; cull : Listof Beings -> Listof Beings
; get rid of every being that's even one pixel offscreen
(define (cull beings)
  (filter (λ (b) (and (> (being-x b) 0) (< (being-x b) WIDTH)
                      (> (being-y b) 0) (< (being-y b) HEIGHT))) beings))
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Game Structures
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; A being is a (make-being Posn Image)
(define-struct being [posn costume])

; A World is a (make-world (Being list) (Being list) (Being list) Being Image Number String Integer)
(define-struct world [dangers shots targets player bg score title timer])

; some easy accessor shortcuts
(define being-x (compose posn-x being-posn))
(define being-y (compose posn-y being-posn))

; Convert world position to screen position.
(define (posn->point posn) (make-posn (posn-x posn) (+ HEIGHT (- (posn-y posn)))))

; world-not-mutators
(define (world-with-dangers w d) (make-world d                 (world-shots w) (world-targets w) (world-player w) (world-bg w) (world-score w) (world-title w) (world-timer w)))
(define (world-with-shots   w s) (make-world (world-dangers w) s               (world-targets w) (world-player w) (world-bg w) (world-score w) (world-title w) (world-timer w)))
(define (world-with-targets w t) (make-world (world-dangers w) (world-shots w) t                 (world-player w) (world-bg w) (world-score w) (world-title w) (world-timer w)))
(define (world-with-player  w p) (make-world (world-dangers w) (world-shots w) (world-targets w) p                (world-bg w) (world-score w) (world-title w) (world-timer w)))
(define (world-with-score   w s) (make-world (world-dangers w) (world-shots w) (world-targets w) (world-player w) (world-bg w) s               (world-title w) (world-timer w)))
(define (world-with-timer   w t) (make-world (world-dangers w) (world-shots w) (world-targets w) (world-player w) (world-bg w) (world-score w) (world-title w) t))

; add-informative-triangle : Number Number String Image -> Image
(define (add-informative-triangle cx cy color background)
  (let* ((player-point (posn->point (make-posn (unbox *player-x*) (unbox *player-y*))))
         (px (posn-x player-point))
         (py (posn-y player-point)))
    (if (and (= px cx) (= py cy))
        background ;; don't inform about the player itself
        (let ((dx (- cx px))
              (dy (- cy py))
              (n->s (λ (num) (number->string (inexact->exact (round num))))))
          (place-image 
           (text (n->s ((unbox *line-length*) cx px)) 12 color)
           (- cx (/ dx 2)) cy
           (place-image
            (line dx 0 color)
            (- cx (/ dx 2)) cy
            (place-image
             (text (n->s ((unbox *line-length*) cy py)) 12 color)
             px (- cy (/ dy 2))
             (place-image
              (line 0 dy color)
              px (- cy (/ dy 2))
              (place-image
               (text (n->s ((unbox *distance*) px py cx cy)) 12 color)
               (- cx (/ dx 2)) (- cy (/ dy 2))
               (place-image
                (line dx dy color)
                (- cx (/ dx 2)) (- cy (/ dy 2))
                background))))))))))

; draw-being : Being Image -> Image
; place a being at their screen location, on the BG, in their costume
(define (draw-being being background)
  (let* ((screen-point (posn->point (being-posn being)))
         (cx (posn-x screen-point))
         (cy (posn-y screen-point))
         (dbg-bkgnd (if (string=? (unbox *distances-color*) "")
                        background
                        (add-informative-triangle cx cy (unbox *distances-color*)
                                                  background))))
    (place-image (being-costume being) cx cy dbg-bkgnd)))

; draw-world : World -> Image
; draw the world, using either a player's costume or an explosion for the player
(define (draw-world w)
  (let* ((score-string (string-append (world-title w) "                    score:"
                                      (number->string (world-score w))))
         (player (if (> (world-timer w) 0)
                     (make-being (being-posn (world-player w))
                                 (radial-star 7 (* 1.5 (world-timer w)) (* .25 (world-timer w))
                                              "solid" EXPLOSION-COLOR))
                     (world-player w)))
         (all-beings
          (append (world-targets w) (world-dangers w) (world-shots w) (list player))))
    (begin
      (set-box! *player-x* (posn-x (being-posn (world-player w))))
      (set-box! *player-y* (posn-y (being-posn (world-player w))))
      
      (set-box! *score* (world-score w))
      (overlay/align "middle" "top" (text/font score-string 18 (unbox TITLE-COLOR) #f 'default 'italic 'bold '#t) 
                     (foldl draw-being (unbox BACKGROUND) all-beings)))))

; wrap-update : (Number->Number or Number Number -> Posn) (list String) -> (Being -> Being)
; wrap the update function to ensure that it takes and returns a Being
(define (wrap-update f)
  (cond
    [(= (procedure-arity f) 1)
     (λ (b) (make-being (make-posn (f (being-x b)) (being-y b)) (being-costume b)))]
    [(= (procedure-arity f) 2)
     (λ (b) (let ((new-posn (f (being-x b) (being-y b))))
              (if (posn? new-posn) (make-being new-posn (being-costume b))
                  (begin (error "update-danger or update-target has been changed to accept an x- and y-coordinate, but is not returning a Posn.\n")
                         new-posn))))]))

; reset : Being (Being->Being) -> Being
; returns a new being with the same costume, entering from the correct direction
(define (reset being f)  
  (let* ((next-posn (being-posn (f (make-being (make-posn 1 1) #f))))
         (next-x (- (posn-x next-posn) 1))
         (next-y (- (posn-y next-posn) 1))
         (random-posn (if (> (abs next-y) (abs next-x))
                          (if (< next-y 0)
                              (make-posn (random WIDTH) (+ (spacing) HEIGHT))
                              (make-posn (random WIDTH) (* (spacing) -1)))
                          (if (< next-x 0) 
                              (make-posn (+ (spacing) WIDTH) (random HEIGHT)) 
                              (make-posn (* (spacing) -1) (random HEIGHT))))))
    (make-being random-posn (being-costume being))))

(define (make-game/proc title title-color background 
                        dangerImgs update-danger 
                        targetImgs update-target 
                        playerImg update-player 
                        projectileImgs update-projectile 
                        distances-color line-length distance 
                        collide onscreen)
  (list title title-color background 
        dangerImgs update-danger 
        targetImgs update-target 
        playerImg update-player
        projectileImgs update-projectile 
        distances-color line-length distance 
        collide onscreen))

(define (play game) (apply animate/proc game))

; animate/proc:String Image (Image list) (Image list) Image 
;              (Being -> Being) (Being -> Being) (Being -> Being)
;              (Being Being -> Boolean) (Being -> Boolean) -> Boolean
; takes in World components, updating functions and geometry functions and starts the universe
(define (animate/proc title title-color
                      background 
                      dangerImgs    update-danger*
                      targetImgs    update-target*
                      playerImg     update-player*
                      projectileImg update-projectile*
                      distances-color line-length distance
                      collide*? onscreen*?)
  (begin
    ;; error-checking
    (unless (string? title)               (display "ERROR: TITLE must be defined as a string.\n"))
    (unless (string? title-color)         (display "ERROR: TITLE-COLOR must be defined as a string.\n"))
    (unless (string? distances-color)     (display "ERROR: The *distances-color* must be defined as a string.\n"))
    (unless (string? title-color)         (display "ERROR: TITLE-COLOR must be defined as a string.\n"))
    (unless (image? background)           (display "ERROR: BACKGROUND must be defined as an image\n."))
    (unless (image? playerImg)            (display "ERROR: PLAYER must be defined as an image\n."))
    (unless (image? projectileImg)        (display "ERROR: mystery must be defined as an image\n."))
    (unless (andmap image? (flatten (list dangerImgs)))
                                          (display "ERROR: DANGERs must be defined as images.\n"))
    (unless (andmap image? (flatten (list targetImgs)))
                                          (display "ERROR: TARGETs must be defined as images.\n"))
    (unless (procedure? update-danger*)   (display "ERROR: update-danger must be defined as a function\n."))
    (unless (procedure? update-target*)   (display "ERROR: update-target must be defined as a function\n."))
    (unless (procedure? update-player*)   (display "ERROR: update-player must be defined as a function\n."))
    (unless (procedure? update-projectile*)(display "ERROR: update-mystery must be defined as a function\n."))
    (unless (procedure? update-player*)   (display "ERROR: update-player must be defined as a function\n."))
    (unless (procedure? line-length)      (display "ERROR: line-length must be defined as a function\n."))
    (unless (procedure? distance)         (display "ERROR: distance must be defined as a function\n."))
    (unless (procedure? collide*?)        (display "ERROR: collide? must be defined as a function\n."))
    (unless (procedure? onscreen*?)       (display "ERROR: onscreen? must be defined as a function\n."))
    
    
    ;; store important values
    (set-box! TITLE-COLOR title-color)
    (set-box! BACKGROUND (fit-image-to WIDTH HEIGHT background))
    (set-box! *line-length* line-length)
    (set-box! *distance* distance)
    (set-box! *distances-color* distances-color)
    
    (let* ((player (make-being (make-posn (/ WIDTH 2) (/ HEIGHT 2)) playerImg))
           
           ; normalize all user functions to use Beings, not x/y coords
           (update-danger (wrap-update update-danger*))
           (update-target (wrap-update update-target*))
           (update-projectile (wrap-update update-projectile*))
           (update-player 
            (λ (p k)(make-being               
                     (if (= (procedure-arity update-player*) 2) 
                         (make-posn (being-x p) (update-player* (being-y p) k))
                         (let ((new-posn (update-player* (being-x p) (being-y p) k)))
                           (if (posn? new-posn) new-posn
                               (begin (error "update-player has been changed to accept an x- and y-coordinate, but is not returning a Posn.\n")
                                      new-posn))))
                     (being-costume p))))
           (onscreen? (if (= (procedure-arity onscreen*?) 1) 
                          (λ (b) (onscreen*? (being-x b)))
                          (λ (b) (onscreen*? (being-x b) (being-y b)))))
           (collide? (λ (b1 b2) (collide*? (being-x b1) (being-y b1) 
                                           (being-x b2) (being-y b2))))
           
           ; did a being collide with any of it's enemies?
           (hit-by? (λ (b enemies) (ormap (λ (e) (collide? b e)) enemies)))
           
           ; reset if a character hit an enemy or went offscreen, update otherwise
           (reset-chars (λ (chars enemies update)
                        (map (λ (b) (if (and (onscreen? b) (not (hit-by? b enemies)))
                                        (update b) (reset b update)))
                             chars)))
           
           ; initialize lists of shots, targets, and dangers using "reset"
           (targets (map (λ (img) (reset (make-being (make-posn 0 0) img) update-target))
                         (flatten (list targetImgs))))
           (dangers (map (λ (img) (reset (make-being (make-posn 0 0) img) update-danger))
                         (flatten (list dangerImgs))))
           (shots '())
           
           ; initialize the world, using a starting score of 100 and the explosion set to 0
           (world (make-world dangers shots targets player background 100 title 0))
           
           ; keypress : World String -> World
           (keypress (λ(w key)
                       (cond
                         [(and (string=? key " ") (<= (world-score w) LOSS-SCORE)) world]
                         [(<= (world-score w) LOSS-SCORE) w]
                         [(string=? key "release") w]
                         [(string=? key "escape") (world-with-timer w -1)]
                         [(and (string=? key " ")
                               (or (> (procedure-arity update-projectile*) 1)
                                   (not (= (update-projectile* 100) 100))))
                          (world-with-shots w (cons (make-being (make-posn (unbox *player-x*) (unbox *player-y*)) projectileImg)
                                                    (world-shots w)))]
                         [else (world-with-player w (update-player (world-player w) key))])))
           
           ; update-world : World -> World
           (update-world (λ (w) 
                           (let* ((player (world-player w))
                                  (bg (world-bg w))
                                  (title (world-title w))
                                  (timer (world-timer w))
                                  ; dangers and targets can be shot, shots and the player can be hit
                                  (shootables (append (world-dangers w) (world-targets w)))
                                  (hitables (cons player (world-shots w)))
                                  
                                  ; reset characters that've been hit or shot, update those that haven't,
                                  ; and cull projectiles that have gone offscreen
                                  (dangers (reset-chars (world-dangers w) hitables update-danger))
                                  (targets (reset-chars (world-targets w) hitables update-target))
                                  (projectiles (reset-chars (cull (world-shots w)) shootables update-projectile))
                                  
                                  ; get points for shooting down dangers
                                  (score (+ (world-score w)
                                            (if (ormap (λ(s) (hit-by? s (world-dangers w))) (world-shots w))
                                                *target-increment* 0))))
                             
                             ; check for gameover, collisions with the *original* dangers / targets
                             (cond
                               [(<= (world-score w) LOSS-SCORE) w]
                               [(> (world-timer w) 0)
                                (make-world dangers projectiles targets player bg 
                                            score title (- timer 10))]
                               [(hit-by? player (world-dangers w))
                                (make-world dangers projectiles targets player bg 
                                            (+ score *danger-increment*) title 100)]
                               [(hit-by? player (world-targets w))
                                (make-world dangers projectiles targets player bg 
                                            (+ score *target-increment*) title (world-timer w))]
                               [else (make-world dangers projectiles targets player bg 
                                                 score title timer)]))
                           )))
      (big-bang world
                (stop-when (λ(w) (= (world-timer w) -1)))
                (on-tick update-world .1)
                (on-draw draw-world)
                (on-key keypress)))))
