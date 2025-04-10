kubectl delete job dashboard-unit-test --ignore-not-found
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: dashboard-unit-test
spec:
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      enableServiceLinks: false
      containers:
      - name: dashboard
        image: ghcr.io/code-dot-org/code-dot-org:f5b2b5ab6c7742c9316bd65c9f4f42b26f348d1bdeece24bac7d7333ae31d7e7
        command: ["zsh", "-c"]
        args:
          - |
            set -e
            export CI=true
            export CI_JOB=unit_tests
            export CI_BUILD_NUMBER=${CI_BUILD_NUMBER:-$RANDOM$RANDOM}
            export CI_TEST_REPORTS=${CI_TEST_REPORTS:-/home/ci/test_reports}
            export RAILS_ENV=test
            export RACK_ENV=test
            export DISABLE_SPRING=1
            export LD_LIBRARY_PATH=/usr/local/lib

            set -x

            {
              git init
              git remote add origin https://github.com/code-dot-org/code-dot-org.git
              git fetch --depth=1 origin HEAD
              git reset --hard FETCH_HEAD
              bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH
              bundle exec rake ci:run_tests
            } || true

            sleep infinity
        tty: true
        env:
          - name: RAILS_ENV
            value: test
          - name: RACK_ENV
            value: test
EOF

# Wait until its ready enough to stream logs
kubectl wait --for=condition=ready pod -l job-name=dashboard-unit-test --timeout=120s
kubectl logs -f job/dashboard-unit-test

# kubectl wait --for=condition=complete job/dashboard-unit-test