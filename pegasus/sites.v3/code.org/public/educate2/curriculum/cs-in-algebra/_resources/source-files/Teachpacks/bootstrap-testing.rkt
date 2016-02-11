(module 
 bootstrap-testing scheme
 
 (require (except-in htdp/testing test))
 (provide assert-equal 
          (rename-out (EXAMPLE EXAMPLE-GREM)))
 
 ;; a `test' macro that is a synonym for `check-expect', catches expansion
 ;; errors and pretends that they come from `test'.
 
 (define *functions-complained-about* (make-hash))
 
 (define (assert-equal expected-value observed-value 
		       expected-expr observed-expr lineno)
   (if (equal? expected-value observed-value)
       (display "") ;; great
       (display
	(if (equal? (format "~a" expected-expr) (format "~a" expected-value))
	    (format
	     (string-append
	      "EXAMPLE CHECK FAILED: \n"
	      "  For ~a at line ~a\n"
	      "  Expected: ~s\n"
	      "   But got: ~s\n")
	     observed-expr lineno
	     expected-value
	     observed-value)
	    (format 
	     (string-append
	      "EXAMPLE CHECK FAILED: \n"
	      "  For ~a at line ~a\n"
	      "  Expected: ~a  =>  ~s\n"
	      "   But got: ~s\n")
	     observed-expr lineno
	     expected-expr expected-value
	     observed-value)))))
 
 (test-silence #t)
 
 (require (for-syntax syntax/kerncase))
 (require (for-syntax syntax/stx))
 (require (for-syntax syntax/to-string))
 
 (define-for-syntax (stx/pp stx)
   (format "~a"
	   (if (stx-list? stx)
	       (string-append "(" (syntax->string stx) ")")
	       (syntax-e stx))))
 
 (define-syntax (EXAMPLE stx)
   (syntax-case stx ()
     [(_ (fn arg ...) answer)
      (if (and (identifier? #'fn) (identifier-binding #'fn))
	  (with-syntax ([observed-expr (stx/pp (syntax (fn arg ...)))]
			[expected-expr (stx/pp (syntax answer))]
			[lineno (syntax-line stx)])
		       (syntax
			(assert-equal answer (fn arg ...) 
				      expected-expr observed-expr lineno)))
	  
	  ;; if the identifier is just not bound
	  (syntax
	   (let ((complained?
		  (hash-ref *functions-complained-about* (quote fn) #f)))
	     (display
	      (if complained? ""
		  (begin
		    (hash-set! *functions-complained-about* (quote fn) #t)
		    (format (string-append 
			     "Either the ~s function is not yet defined or "
			     "an example is above the definition.\n")
			    (quote fn))))))))]))

  
  
  )
