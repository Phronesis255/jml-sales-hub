"""Serve the hub on a stable local origin so browser memory is reused."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen
import argparse
import hashlib
import sys
import webbrowser


PORT = argparse.ArgumentParser(description=__doc__)
PORT.add_argument("--port", type=int, default=8766)
ADDRESS = ("127.0.0.1", PORT.parse_args().port)
URL = f"http://127.0.0.1:{ADDRESS[1]}/social-workspace.html"
HUB = Path(__file__).resolve().parents[1]
CHECKOUT = hashlib.sha256(str(HUB).encode()).hexdigest()[:20]


class HubServer(ThreadingHTTPServer):
    request_queue_size = 128


class HubFiles(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("X-JML-Workspace", CHECKOUT)
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)

    def send_head(self):
        path = Path(self.translate_path(self.path)).resolve()
        if not path.is_relative_to(HUB) or any(part.startswith(".") for part in path.relative_to(HUB).parts):
            self.send_error(404)
            return None
        return super().send_head()


def workspace_running():
    try:
        with urlopen(URL, timeout=2) as response:
            return response.headers.get("X-JML-Workspace") == CHECKOUT and b"social-workspace/app.js" in response.read(64000)
    except (URLError, TimeoutError, OSError):
        return False


def main():
    if workspace_running():
        webbrowser.open(URL)
        return 0
    try:
        server = HubServer(ADDRESS, partial(HubFiles, directory=str(HUB)))
    except OSError as error:
        print(f"Could not open the local workspace at {URL}. {error}", file=sys.stderr)
        return 1
    with server:
        print(f"JML Social Workspace is open at {URL}")
        print("Keep this window open while working. Press Ctrl+C to stop the server.")
        webbrowser.open(URL)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
