#!/bin/bash
cd /home/kavia/workspace/code-generation/online-shopping-platform-16294/express_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

