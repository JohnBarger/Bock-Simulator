from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    os.chdir(root)
    server = ThreadingHTTPServer(("127.0.0.1", 4173), SimpleHTTPRequestHandler)
    print("BOCK local server listening on http://127.0.0.1:4173")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBOCK server halted.")


if __name__ == "__main__":
    main()
