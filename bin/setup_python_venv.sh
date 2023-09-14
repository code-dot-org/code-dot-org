if [ "$(uname)" = "Darwin" ]; then
  REQUIREMENTS=requirements-mac.txt
elif [ "$(uname)" = "Linux" ]; then
  REQUIREMENTS=requirements.txt
else
  echo "$(uname) not supported"
  exit 1
fi

PYTHON_FOR_SETUP=python3.8

$PYTHON_FOR_SETUP -mvenv pybin
source pybin/bin/activate
$PYTHON_FOR_SETUP -m pip install -U pip
pip install -r $REQUIREMENTS
