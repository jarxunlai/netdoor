from __future__ import annotations

import http.server
import socket
import socketserver
import sys
from pathlib import Path


def find_available_port(start: int = 8010, attempts: int = 20) -> int:
    for port in range(start, start + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("127.0.0.1", port))
            except OSError:
                continue
        return port
    raise RuntimeError(f"no available port in range {start}-{start + attempts - 1}")


def main() -> int:
    port = find_available_port()
    root = Path(__file__).resolve().parent.parent
    handler = http.server.SimpleHTTPRequestHandler

    class ReusableTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    with ReusableTCPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Serving {root} at http://127.0.0.1:{port}")
        old_cwd = Path.cwd()
        try:
            import os

            os.chdir(root)
            httpd.serve_forever()
        except KeyboardInterrupt:
            return 0
        finally:
            os.chdir(old_cwd)


if __name__ == "__main__":
    raise SystemExit(main())
