#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Servidor rodando em http://localhost:{PORT}")
    print(f"Acesse do iPad: http://SEU_IP_LOCAL:{PORT}")
    print("\nPara descobrir seu IP local, execute: ifconfig | grep 'inet '")
    print("\nPressione Ctrl+C para parar o servidor")
    httpd.serve_forever()