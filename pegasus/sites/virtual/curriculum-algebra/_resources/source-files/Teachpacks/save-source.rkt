(module
    save-source
  scheme
  (require lang/prim
           racket/bool
           rackunit
           (for-syntax racket/base))
  (provide define/save-source)
  (provide-higher-order-primitive procedure-name (fn))
  (provide-higher-order-primitive procedure-source (fn))
  (provide set-evaluates-to-string!)
  (provide replace-evaluates-to)
  (provide-higher-order-primitive explain-function (fn inputs))

  (define EXAMPLE check-equal?)
  
  (define *procedure-name-hash* (make-hash))  
  (define *procedure-source-hash* (make-hash))  
  (define (save-source! fn name body)  
    (hash-set! *procedure-name-hash* fn name)
    (hash-set! *procedure-source-hash* fn body))
  
  (define-syntax define/save-source
    (syntax-rules ()
      ((_ (name formals ...) body-expressions ...)
       (begin
         (define name (λ(formals ...) body-expressions ...))
         (save-source! name 'name '(λ(formals ...) body-expressions ...))))
      ((_ name (λ(formals ...) body-expressions ...))
       (begin
         (define name (λ(formals ...) body-expressions ...))
         (save-source! name 'name '(λ(formals ...) body-expressions ...))))
      ((_ name value)
       (define name value))))

  (define/save-source (an-example-function-to-explain x y) (and (< x y) (> x (- y 50))))

  ;; procedure-name : Function -> Symbol
  (define (procedure-name fn)
    (hash-ref *procedure-name-hash* fn false))
  (EXAMPLE (procedure-name an-example-function-to-explain)
           'an-example-function-to-explain)

  ;; procedure-source : Function -> Code
  (define (procedure-source fn)
    (hash-ref *procedure-source-hash* fn false))
  (EXAMPLE (procedure-source an-example-function-to-explain)
           '(λ (x y) (and (< x y) (> x (- y 50)))))
  
  ;; any->string : any number of any kind of thing -> string
  ;; Make string representations of each input, and concatenate 
  ;; them into a single string.
  (define (any->string . args)
    (apply string-append (map (lambda (i) (if (boolean? i) (if i "true" "false") (format "~a" i))) args)))
  (EXAMPLE (any->string 'hi " I'm " #\= 99 false) "hi I'm =99false")
  
  (define *evaluates-to* "==>")
  ;; set-evaluates-to-string! str
  (define (set-evaluates-to-string! str)
    (set! *evaluates-to* str))
  ;; for ease of testing:
  ;; e : String -> String
  ;; Transform every instance of "»" in the expected string into whatever form of 
  ;; *evaluates-to* we should actually be expecting.
  (define (replace-evaluates-to str)
    (apply string-append
           (map (λ(l) (if (equal? l #\») *evaluates-to* (string l)))
                (string->list str))))
  ;; for convenience:
  (define e replace-evaluates-to)
  
  ;; show-named-value : Any List List -> String|Any
  ;; If the item is in the list of names, return "name»value" with the corresponding value
  ;; Otherwise return the original item.
  (define (show-named-value item names values)
    (cond 
      [(empty? names) item]
      [(equal? (first names) item) (any->string item *evaluates-to* (first values))]
      [else (show-named-value item (rest names) (rest values))]))
  (EXAMPLE (show-named-value 3 '() '()) 3)
  (EXAMPLE (show-named-value 3 '(a b c) '(4 5 6)) 3)
  (EXAMPLE (show-named-value 'd '(a b c) '(4 5 6)) 'd)
  (EXAMPLE (show-named-value '(b) '(a b c) '(4 5 6)) '(b))
  (EXAMPLE (show-named-value 'a '(a b c) '(4 5 6)) (e "a»4"))
  (EXAMPLE (show-named-value 'b '(a b c) '(4 5 6)) (e "b»5"))
  (EXAMPLE (show-named-value 'c '(a b c) '(4 5 6)) (e "c»6"))

  ;; show-named-values : List List List -> String
  ;; Stringify the source-piece, replacing each instance of name with "name»value"
  (define (show-named-values source-piece names values) 
    (any->string 
     (map (λ (item) 
            (if (list? item)
                (show-named-values item names values)
                (show-named-value item names values))) 
          source-piece)))
  (EXAMPLE (show-named-values (procedure-source an-example-function-to-explain) '(λ x y) '(foo 60 101))
           (e "(λ»foo (x»60 y»101) (and (< x»60 y»101) (> x»60 (- y»101 50))))"))
  
  ;; replace-variable : Symbol-or-Value (List Names) (List Values) -> Symbol-or-Value
  ;; If the item is a Symbol in the list of Names, return its corresponding Value. 
  ;; Otherwise return the item itself.
  (define (replace-variable item names values)
    (cond 
      [(empty? names) item]
      [(equal? (first names) item) (first values)]
      [else (replace-variable item (rest names) (rest values))]))
  (EXAMPLE (replace-variable 3 '() '()) 3)
  (EXAMPLE (replace-variable 3 '(a b c) '(4 5 6)) 3)
  (EXAMPLE (replace-variable 'd '(a b c) '(4 5 6)) 'd)
  (EXAMPLE (replace-variable '(b) '(a b c) '(4 5 6)) '(b))
  (EXAMPLE (replace-variable 'a '(a b c) '(4 5 6)) 4)
  (EXAMPLE (replace-variable 'b '(a b c) '(4 5 6)) 5)
  (EXAMPLE (replace-variable 'c '(a b c) '(4 5 6)) 6)
  ;; replace-variables : Code (list Name) (list Value) -> Code
  ;; Replace all instances of any Name in the list of names with its corresponding 
  ;; Value from the list of values.  Naturally we expect Names and Values to be of 
  ;; the same length.
  (define (replace-variables source-piece names values) 
    (cond
      [(list? source-piece)
       (map (λ (item) (replace-variables item names values)) 
            source-piece)]
      [else (replace-variable source-piece names values)]))
  (EXAMPLE (replace-variables (procedure-source an-example-function-to-explain) '(λ x y) '(foo 60 101))
           '(foo (60 101) (and (< 60 101) (> 60 (- 101 50)))))
  (EXAMPLE (replace-variables #t '() '())
           true)
  
  ;; or-map : Function List -> Boolean
  ;; Apply the test function to each element of the list until it returns a true
  ;; value on some element or reaches the end of the list.  If any time it was true,
  ;; immediately return true.  If it reached the end of the list, return false.
  (define (or-map test lst)
    (cond
      [(empty? lst)       false]
      [(test (first lst)) true]
      [else               (or-map test (rest lst))]))
  (EXAMPLE (or-map even? empty) false)
  (EXAMPLE (or-map even? '(1)) false)
  (EXAMPLE (or-map even? '(2)) true)
  (EXAMPLE (or-map even? '(1 3)) false)
  (EXAMPLE (or-map even? '(1 2)) true)
  (EXAMPLE (or-map even? '(1 3 5)) false)
  (EXAMPLE (or-map even? '(1 2 3)) true)
  (EXAMPLE (let* ((n 0)
                  (f (λ (x) (set! n (+ n 1)) (even? x))))
             (and (or-map f '(1 2 3 4 5 6 7 8 9))
                  (= n 2)))
           true) ;; test that we short-circuit correctly

  ;; for eval
  (define-namespace-anchor namespace-anchor)
  (define default-namespace (namespace-anchor->namespace namespace-anchor))
    
  ;; take-step : Code (list Name) (list Value) -> Code
  (define (take-step state vars inputs)
    (cond
      [(not (list? state))           state]
      [(empty? state)                state]
      [(equal? 'quote (first state)) state]
      [ ;; NOTE: this is still a bad case, because then the next step fails.  Do Not Use Lists!
       (equal? 'list (first state))  (replace-variables state vars inputs)]
      [(not (or-map list? state))    (replace-variables 
                                      (eval (replace-variables state vars inputs) default-namespace)
                                      '(#t #f) '(true false))]
      [(list? (first state))         (cons (take-step (first state) vars inputs) (rest state))]
      [else                          (cons (first state) (take-step (rest state) vars inputs))]))
  (EXAMPLE (take-step empty '(x y) '(60 101))
           empty)
  (EXAMPLE (take-step "hi" '(x y) '(60 101))
           "hi")
  (EXAMPLE (take-step '(list x y) '(x y) '(60 101))
           '(list 60 101))
  (EXAMPLE (take-step '('(x y)) '(x y) '(60 101))
           '((quote (x y))))
  (EXAMPLE (take-step '(and (< x y) (> x (- y 50))) '(x y) '(60 101))
           '(and true (> x (- y 50))))
  (EXAMPLE (take-step '(and true (> x (- y 50))) '(x y) '(60 101))
           '(and true (> x 51)))
  (EXAMPLE (take-step '(and true (> x 51)) '(x y) '(60 101))
           '(and true true))
  (EXAMPLE (take-step '(and true true) '(x y) '(60 101))
           'true)
  
  ;; show-eval-step : Code Code (list Name) (list Value) -> String
  (define (show-eval-step body state vars inputs)
    (cond
      [(list? state)       (string-append
                            "("
                            (string-join 
                             (map (λ(body-item state-item) 
                                    (show-eval-step body-item state-item vars inputs)) 
                                  body state) " ")
                            ")")]
      [(equal? body state) (any->string (show-named-value body vars inputs))] 
      [else                (any->string body *evaluates-to* (show-named-value state vars inputs))]))
  (EXAMPLE (show-eval-step '(and (< x y) (> x (- y 50))) '(and (< x y) (> x (- y 50))) '(x y) '(60 101))
           (e "(and (< x»60 y»101) (> x»60 (- y»101 50)))"))
  (EXAMPLE (show-eval-step '(and (< x y) (> x (- y 50))) '(and true (> x (- y 50))) '(x y) '(60 101))
           (e "(and (< x y)»true (> x»60 (- y»101 50)))"))
  (EXAMPLE (show-eval-step '(and (< x y) (> x (- y 50))) '(and true (> x 51)) '(x y) '(60 101))
           (e "(and (< x y)»true (> x»60 (- y 50)»51))"))
  (EXAMPLE (show-eval-step '(and (< x y) (> x (- y 50))) '(and true true) '(x y) '(60 101))
           (e "(and (< x y)»true (> x (- y 50))»true)"))
  (EXAMPLE (show-eval-step '(and (< x y) (> x (- y 50))) true '(x y) '(60 101))
           (e "(and (< x y) (> x (- y 50)))»true"))
  
  ;; show-eval-steps : Code Code (list Name) (list Value) -> (list String)
  (define (show-eval-steps body state vars inputs)
    (cond
      [(list? state) (let ((next-step (take-step state vars inputs)))
                       (cons (show-eval-step body state vars inputs)
                             (show-eval-steps body next-step vars inputs)))]
      [else          (list (show-eval-step body state vars inputs))]))
  (EXAMPLE (show-eval-steps '(and (< x y) (> x (- y 50))) '(and (< x y) (> x (- y 50))) '(x y) '(60 101))
           (list
            (e "(and (< x»60 y»101) (> x»60 (- y»101 50)))")
            (e "(and (< x y)»true (> x»60 (- y»101 50)))")
            (e "(and (< x y)»true (> x»60 (- y 50)»51))")
            (e "(and (< x y)»true (> x (- y 50))»true)")
            (e "(and (< x y) (> x (- y 50)))»true")))        
  
  ;; explain-function : Function List -> String
  ;; Show what the function is doing at a given step.
  ;; Steps correspond to each open paren, with zero being top-level.
  ;; The function must have been saved using define/save-source so 
  ;; this method can use procedure-source and procedure-name.
  (define (explain-function fn inputs)
    (let* ((src (procedure-source fn))
           (name (procedure-name fn))
           (vars (second src))
           (body (third src)))
      (append
       (list
        (any->string 
         "(" name " "
         (string-join (map (λ (v) (show-named-value v vars inputs)) vars) 
                      " ")
         ")" *evaluates-to* (apply fn inputs)))
       (show-eval-steps body body vars inputs)
       (list
        (any->string 
         "(" name " " (string-join (map any->string vars) " ") ")" *evaluates-to* (apply fn inputs))))))
  (EXAMPLE (explain-function an-example-function-to-explain (list 60 101))
           (list 
            (e "(an-example-function-to-explain x»60 y»101)»true")
            (e "(and (< x»60 y»101) (> x»60 (- y»101 50)))")
            (e "(and (< x y)»true (> x»60 (- y»101 50)))")
            (e "(and (< x y)»true (> x»60 (- y 50)»51))")
            (e "(and (< x y)»true (> x (- y 50))»true)")
            (e "(and (< x y) (> x (- y 50)))»true")
            (e "(an-example-function-to-explain x y)»true")))

)