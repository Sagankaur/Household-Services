**Household Services Application**
It is a multi-user app (requires one admin and other service professionals/ customers) which acts as platform for providing comprehensive home servicing and solutions.

This Project is part of Application Development 2 course (IIT Madras BS degree).

# Set Up
All of these things should be done in WSL terminal.
1. Make .venv and node_modules
2. Python3 app.py
3. npm run serve  (http://localhost:8080/)
4. sudo systemctl stop redis (to stop redis, if running)
5. redis-server
6. celery -A application.jobs.workers worker --loglevel=info
7. celery -A application.jobs.workers beat --loglevel=info
8. mailhog        (http://localhost:8025/)
