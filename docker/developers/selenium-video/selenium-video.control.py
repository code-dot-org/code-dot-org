from http.server import BaseHTTPRequestHandler,HTTPServer
from urllib.parse import urlparse
from urllib.parse import parse_qs
from os import environ
from os import system
import subprocess
import json
import psutil

video_ready_port = int(environ.get('VIDEO_CONTROL_PORT', 9001))

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        print(parsed)
        print(params)
        response_code = 404
        response_body = b''

        if parsed.path == '/start':
            print('starting')

            # Build our environment as a copy of our own plus the params
            env = dict(environ)
            for k, v in params.items():
                params[k] = v[0]
            env = {**env, **params}

            # Run the video.sh script
            process = subprocess.Popen('/opt/bin/video.sh', env=env)

            # Return the PID as a response
            response_body = json.dumps({'pid': process.pid}).encode('utf-8')
        elif parsed.path == '/stop':
            # Gracefully terminate the video.sh script
            pid = params.get('pid', [])
            if len(pid) > 0:
                print(f'stopping process with pid {pid[0]}')

                try:
                    p = psutil.Process(int(pid[0]))
                    p.terminate()
                except psutil.NoSuchProcess:
                    print('video process already stopped. ignoring.')
            else:
                print('no pid given to /stop. ignoring.')
        elif parsed.path == '/stopall':
            # Stops ALL ffmpeg processes
            system('pkill -INT ffmpeg')
        elif parsed.path == '/status':
            # This just notices that SOMEBODY is recording something
            video_ready = "ffmpeg" in (p.name().lower() for p in psutil.process_iter())
            response_code = 200 if video_ready else 404
            response_text = "ready" if video_ready else "not ready"
            response_body = json.dumps({'status': response_text}).encode('utf-8')

        self.send_response(response_code)
        self.end_headers()
        self.wfile.write(response_body)

httpd = HTTPServer( ('0.0.0.0', video_ready_port), Handler )
httpd.serve_forever()
