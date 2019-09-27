for i in 15 18 20
do 
  echo $i
  node bin/evaluate_scripts.js --trainingnum=$i --cat0_dir '../evaluationtestimages/smilyfrownyfaces/frownyfaces/' --cat1_dir '../evaluationtestimages/smilyfrownyfaces/smilyfaces/'
done

