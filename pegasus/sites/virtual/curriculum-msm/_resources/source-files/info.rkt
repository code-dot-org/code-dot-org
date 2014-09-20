#lang setup/infotab

;; For internal use only.
;;
;; We mark this directory to be ignored by raco setup.  Files in this directory
;; have deliberate syntax errors, and we don't want Racket to compile them
;; on installation/compilation time.
(define compile-omit-paths 'all)