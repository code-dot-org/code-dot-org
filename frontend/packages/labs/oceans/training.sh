for i in 15 18 20
do 
  echo $i
  node bin/evaluate_scripts.js --trainingnum=$i
done

